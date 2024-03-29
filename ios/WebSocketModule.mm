/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "WebSocketModule.h"
#import "WebSocketSecureModule/NativeModules.h"
#import "WebSocketSecureModule/WebsocketSecureModuleSpec.h"

#import <objc/runtime.h>

#import <React/RCTConvert.h>
#import <React/RCTSRWebSocket.h>
#import <React/RCTUtils.h>
#import <React/RCTLog.h>

#import "CoreModulesPlugins.h"

#define RCTSRLog(format...) RCTLogInfo(format)

@implementation RCTSRWebSocket (React)

- (NSNumber *)reactTag
{
  return objc_getAssociatedObject(self, _cmd);
}

- (void)setReactTag:(NSNumber *)reactTag
{
  objc_setAssociatedObject(self, @selector(reactTag), reactTag, OBJC_ASSOCIATION_COPY_NONATOMIC);
}

@end

@interface RCTWebSocketSecureModule () <RCTSRWebSocketDelegate, NativeWebSocketSecureModuleSpec>

@end

@implementation RCTWebSocketSecureModule {
  NSMutableDictionary<NSNumber *, RCTSRWebSocket *> *_sockets;
  NSMutableDictionary<NSNumber *, id<RCTWebSocketSecureContentHandler>> *_contentHandlers;
}

RCT_EXPORT_MODULE()

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (NSArray *)supportedEvents
{
  return @[ @"websocketMessage", @"websocketOpen", @"websocketFailed", @"websocketClosed" ];
}

- (void)invalidate
{
  _contentHandlers = nil;
  for (RCTSRWebSocket *socket in _sockets.allValues) {
    socket.delegate = nil;
    [socket close];
  }
}

RCT_EXPORT_METHOD(connect
                  : (NSURL *)URL protocols
                  : (NSArray *)protocols options
                  : (JS::NativeWebSocketSecureModule::SpecConnectOptions &)options socketID
                  : (double)socketID)
{
  NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:URL];

  // We load cookies from sharedHTTPCookieStorage (shared with XHR and
  // fetch). To get secure cookies for wss URLs, replace wss with https
  // in the URL.
  NSURLComponents *components = [NSURLComponents componentsWithURL:URL resolvingAgainstBaseURL:true];
  if ([components.scheme.lowercaseString isEqualToString:@"wss"]) {
    components.scheme = @"https";
  }

  // Load and set the cookie header.
  NSArray<NSHTTPCookie *> *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookiesForURL:components.URL];
  request.allHTTPHeaderFields = [NSHTTPCookie requestHeaderFieldsWithCookies:cookies];

  // Load supplied headers
  if ([options.headers() isKindOfClass:NSDictionary.class]) {
    NSDictionary *headers = (NSDictionary *)options.headers();
    [headers enumerateKeysAndObjectsUsingBlock:^(NSString *key, id value, BOOL *stop) {
      [request addValue:[RCTConvert NSString:value] forHTTPHeaderField:key];
    }];
  }

  NSMutableURLRequest *mutableRequest;
  mutableRequest = request.mutableCopy;

  if ([options.ca() isKindOfClass:NSString.class]) {
    NSRange r1 = [options.ca() rangeOfString:@"-----BEGIN CERTIFICATE-----"];
    NSRange r2 = [options.ca() rangeOfString:@"-----END CERTIFICATE-----"];
    NSRange rSub = NSMakeRange(r1.location + r1.length, r2.location - r1.location - r1.length);
    NSString *subCert = [options.ca() substringWithRange:rSub];

    NSData *rawCertificate = [[NSData alloc] initWithBase64Encoding:subCert];
    SecCertificateRef parsedCertificate = SecCertificateCreateWithData(NULL, (__bridge CFDataRef)rawCertificate);

    NSArray* certArray = @[ (__bridge id)parsedCertificate ];

    [mutableRequest setRCTSR_SSLPinnedCertificates:certArray];
  }

  RCTSRWebSocket *webSocket = [[RCTSRWebSocket alloc] initWithURLRequest:mutableRequest protocols:protocols];
  [webSocket setDelegateDispatchQueue:[self methodQueue]];
  webSocket.delegate = self;
  webSocket.reactTag = @(socketID);
  if (!_sockets) {
    _sockets = [NSMutableDictionary new];
  }
  _sockets[@(socketID)] = webSocket;
  [webSocket open];
}

RCT_EXPORT_METHOD(send : (NSString *)message forSocketID : (double)socketID)
{
  [_sockets[@(socketID)] send:message];
}

RCT_EXPORT_METHOD(sendBinary : (NSString *)base64String forSocketID : (double)socketID)
{
  [self sendData:[[NSData alloc] initWithBase64EncodedString:base64String options:0] forSocketID:@(socketID)];
}

- (void)sendData:(NSData *)data forSocketID:(NSNumber *__nonnull)socketID
{
  [_sockets[socketID] send:data];
}

RCT_EXPORT_METHOD(ping : (double)socketID)
{
  [_sockets[@(socketID)] sendPing:NULL];
}

RCT_EXPORT_METHOD(close : (double)code reason : (NSString *)reason socketID : (double)socketID)
{
  [_sockets[@(socketID)] closeWithCode:code reason:reason];
  [_sockets removeObjectForKey:@(socketID)];
}

- (void)setContentHandler:(id<RCTWebSocketSecureContentHandler>)handler forSocketID:(NSString *)socketID
{
  if (!_contentHandlers) {
    _contentHandlers = [NSMutableDictionary new];
  }
  _contentHandlers[socketID] = handler;
}

#pragma mark - RCTSRWebSocketDelegate methods

- (void)webSocket:(RCTSRWebSocket *)webSocket didReceiveMessage:(id)message
{
  NSString *type;

  NSNumber *socketID = [webSocket reactTag];
  id contentHandler = _contentHandlers[socketID];
  if (contentHandler) {
    message = [contentHandler processWebsocketMessage:message forSocketID:socketID withType:&type];
  } else {
    if ([message isKindOfClass:[NSData class]]) {
      type = @"binary";
      message = [message base64EncodedStringWithOptions:0];
    } else {
      type = @"text";
    }
  }

  [self sendEventWithName:@"websocketMessage" body:@{@"data" : message, @"type" : type, @"id" : webSocket.reactTag}];
}

- (void)webSocketDidOpen:(RCTSRWebSocket *)webSocket
{
  [self sendEventWithName:@"websocketOpen"
                     body:@{@"id" : webSocket.reactTag, @"protocol" : webSocket.protocol ? webSocket.protocol : @""}];
}

- (void)webSocket:(RCTSRWebSocket *)webSocket didFailWithError:(NSError *)error
{
  NSNumber *socketID = [webSocket reactTag];
  _contentHandlers[socketID] = nil;
  _sockets[socketID] = nil;
  [self sendEventWithName:@"websocketFailed" body:@{@"message" : error.localizedDescription, @"id" : socketID}];
}

- (void)webSocket:(RCTSRWebSocket *)webSocket
    didCloseWithCode:(NSInteger)code
              reason:(NSString *)reason
            wasClean:(BOOL)wasClean
{
  NSNumber *socketID = [webSocket reactTag];
  _contentHandlers[socketID] = nil;
  _sockets[socketID] = nil;
  [self sendEventWithName:@"websocketClosed"
                     body:@{
                       @"code" : @(code),
                       @"reason" : RCTNullIfNil(reason),
                       @"clean" : @(wasClean),
                       @"id" : socketID
                     }];
}

- (std::shared_ptr<facebook::react::TurboModule>)
    getTurboModuleWithJsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker
                  nativeInvoker:(std::shared_ptr<facebook::react::CallInvoker>)nativeInvoker
                     perfLogger:(id<RCTTurboModulePerformanceLogger>)perfLogger
{
  return std::make_shared<facebook::react::NativeWebSocketSecureModuleSpecJSI>(self, jsInvoker, nativeInvoker, perfLogger);
}

@end

@implementation RCTBridge (RCTWebSocketSecureModule)

- (RCTWebSocketSecureModule *)webSocketSecureModule
{
  return [self moduleForClass:[RCTWebSocketSecureModule class]];
}

@end

Class RCTWebSocketSecureModuleCls(void)
{
  return RCTWebSocketSecureModule.class;
}
