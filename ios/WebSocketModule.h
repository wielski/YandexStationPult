/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <React/RCTEventEmitter.h>

NS_ASSUME_NONNULL_BEGIN

@protocol RCTWebSocketSecureContentHandler <NSObject>

- (id)processWebsocketMessage:(id __nullable)message
                  forSocketID:(NSNumber *)socketID
                     withType:(NSString *__nonnull __autoreleasing *__nonnull)type;

@end

@interface RCTWebSocketSecureModule : RCTEventEmitter

// Register a custom handler for a specific websocket. The handler will be strongly held by the WebSocketModule.
- (void)setContentHandler:(id<RCTWebSocketSecureContentHandler> __nullable)handler forSocketID:(NSNumber *)socketID;

- (void)sendData:(NSData *)data forSocketID:(nonnull NSNumber *)socketID;

@end

@interface RCTBridge (RCTWebSocketSecureModule)

- (RCTWebSocketSecureModule *)webSocketSecureModule;

@end

NS_ASSUME_NONNULL_END
