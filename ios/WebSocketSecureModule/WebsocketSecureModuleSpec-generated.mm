
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "WebsocketSecureModuleSpec.h"
@implementation RCTCxxConvert (NativeWebSocketSecureModule_SpecConnectOptions)
+ (RCTManagedPointer *)JS_NativeWebSocketSecureModule_SpecConnectOptions:(id)json
{
  return facebook::react::managedPointer<JS::NativeWebSocketSecureModule::SpecConnectOptions>(json);
}
@end
namespace facebook {
namespace react {

static facebook::jsi::Value __hostFunction_NativeWebSocketSecureModuleSpecJSI_connect(facebook::jsi::Runtime& rt, TurboModule &turboModule, const facebook::jsi::Value* args, size_t count) {
  return static_cast<ObjCTurboModule &>(turboModule)
         .invokeObjCMethod(rt, VoidKind, "connect", @selector(connect:protocols:options:socketID:), args, count);
}
static facebook::jsi::Value __hostFunction_NativeWebSocketSecureModuleSpecJSI_send(facebook::jsi::Runtime& rt, TurboModule &turboModule, const facebook::jsi::Value* args, size_t count) {
  return static_cast<ObjCTurboModule &>(turboModule)
         .invokeObjCMethod(rt, VoidKind, "send", @selector(send:forSocketID:), args, count);
}
static facebook::jsi::Value __hostFunction_NativeWebSocketSecureModuleSpecJSI_sendBinary(facebook::jsi::Runtime& rt, TurboModule &turboModule, const facebook::jsi::Value* args, size_t count) {
  return static_cast<ObjCTurboModule &>(turboModule)
         .invokeObjCMethod(rt, VoidKind, "sendBinary", @selector(sendBinary:forSocketID:), args, count);
}
static facebook::jsi::Value __hostFunction_NativeWebSocketSecureModuleSpecJSI_ping(facebook::jsi::Runtime& rt, TurboModule &turboModule, const facebook::jsi::Value* args, size_t count) {
  return static_cast<ObjCTurboModule &>(turboModule)
         .invokeObjCMethod(rt, VoidKind, "ping", @selector(ping:), args, count);
}
static facebook::jsi::Value __hostFunction_NativeWebSocketSecureModuleSpecJSI_close(facebook::jsi::Runtime& rt, TurboModule &turboModule, const facebook::jsi::Value* args, size_t count) {
  return static_cast<ObjCTurboModule &>(turboModule)
         .invokeObjCMethod(rt, VoidKind, "close", @selector(close:reason:socketID:), args, count);
}
static facebook::jsi::Value __hostFunction_NativeWebSocketSecureModuleSpecJSI_addListener(facebook::jsi::Runtime& rt, TurboModule &turboModule, const facebook::jsi::Value* args, size_t count) {
  return static_cast<ObjCTurboModule &>(turboModule)
         .invokeObjCMethod(rt, VoidKind, "addListener", @selector(addListener:), args, count);
}
static facebook::jsi::Value __hostFunction_NativeWebSocketSecureModuleSpecJSI_removeListeners(facebook::jsi::Runtime& rt, TurboModule &turboModule, const facebook::jsi::Value* args, size_t count) {
  return static_cast<ObjCTurboModule &>(turboModule)
         .invokeObjCMethod(rt, VoidKind, "removeListeners", @selector(removeListeners:), args, count);
}

NativeWebSocketSecureModuleSpecJSI::NativeWebSocketSecureModuleSpecJSI(id<RCTTurboModule> instance, std::shared_ptr<CallInvoker> jsInvoker, std::shared_ptr<CallInvoker> nativeInvoker, id<RCTTurboModulePerformanceLogger> perfLogger)
: ObjCTurboModule("WebSocketSecureModule", instance, jsInvoker, nativeInvoker, perfLogger) {
  methodMap_["connect"] = MethodMetadata {4, __hostFunction_NativeWebSocketSecureModuleSpecJSI_connect};
  methodMap_["send"] = MethodMetadata {2, __hostFunction_NativeWebSocketSecureModuleSpecJSI_send};
  methodMap_["sendBinary"] = MethodMetadata {2, __hostFunction_NativeWebSocketSecureModuleSpecJSI_sendBinary};
  methodMap_["ping"] = MethodMetadata {1, __hostFunction_NativeWebSocketSecureModuleSpecJSI_ping};
  methodMap_["close"] = MethodMetadata {3, __hostFunction_NativeWebSocketSecureModuleSpecJSI_close};
  methodMap_["addListener"] = MethodMetadata {1, __hostFunction_NativeWebSocketSecureModuleSpecJSI_addListener};
  methodMap_["removeListeners"] = MethodMetadata {1, __hostFunction_NativeWebSocketSecureModuleSpecJSI_removeListeners};
  setMethodArgConversionSelector(@"connect", 2, @"JS_NativeWebSocketSecureModule_SpecConnectOptions:");
}



} // namespace react
} // namespace facebook
