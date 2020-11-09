
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <vector>

#import <Foundation/Foundation.h>

#import <React/RCTBridgeModule.h>

#import <ReactCommon/RCTTurboModule.h>
#import <RCTRequired/RCTRequired.h>
#import <RCTTypeSafety/RCTTypedModuleConstants.h>
#import <React/RCTCxxConvert.h>
#import <React/RCTManagedPointer.h>
#import <RCTTypeSafety/RCTConvertHelpers.h>




namespace JS {
  namespace NativeWebSocketSecureModule {
    struct SpecConnectOptions {
      id<NSObject> headers() const;
      NSString *ca() const;
      NSString *pfx() const;
      NSString *passphrase() const;

      SpecConnectOptions(NSDictionary *const v) : _v(v) {}
    private:
      NSDictionary *_v;
    };
  }
}

@interface RCTCxxConvert (NativeWebSocketSecureModule_SpecConnectOptions)
+ (RCTManagedPointer *)JS_NativeWebSocketSecureModule_SpecConnectOptions:(id)json;
@end

inline id<NSObject> JS::NativeWebSocketSecureModule::SpecConnectOptions::headers() const
{
  id const p = _v[@"headers"];
  return p;
}


inline NSString *JS::NativeWebSocketSecureModule::SpecConnectOptions::ca() const
{
  id const p = _v[@"ca"];
  return RCTBridgingToString(p);
}


inline NSString *JS::NativeWebSocketSecureModule::SpecConnectOptions::pfx() const
{
  id const p = _v[@"pfx"];
  return RCTBridgingToString(p);
}


inline NSString *JS::NativeWebSocketSecureModule::SpecConnectOptions::passphrase() const
{
  id const p = _v[@"passphrase"];
  return RCTBridgingToString(p);
}



@protocol NativeWebSocketSecureModuleSpec <RCTBridgeModule, RCTTurboModule>
- (void) connect:(NSString *)url
   protocols:(NSArray *)protocols
   options:(JS::NativeWebSocketSecureModule::SpecConnectOptions&)options
   socketID:(double)socketID;
- (void) send:(NSString *)message
   forSocketID:(double)forSocketID;
- (void) sendBinary:(NSString *)base64String
   forSocketID:(double)forSocketID;
- (void) ping:(double)socketID;
- (void) close:(double)code
   reason:(NSString *)reason
   socketID:(double)socketID;
- (void) addListener:(NSString *)eventName;
- (void) removeListeners:(double)count;
@end


namespace facebook {
namespace react {

class JSI_EXPORT NativeWebSocketSecureModuleSpecJSI : public ObjCTurboModule {
public:
  NativeWebSocketSecureModuleSpecJSI(id<RCTTurboModule> instance, std::shared_ptr<CallInvoker> jsInvoker, std::shared_ptr<CallInvoker> nativeInvoker, id<RCTTurboModulePerformanceLogger> perfLogger);
};

} // namespace react
} // namespace facebook
