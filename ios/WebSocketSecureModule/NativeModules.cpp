
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "NativeModules.h"

namespace facebook {
namespace react {


static jsi::Value __hostFunction_NativeWebSocketSecureModuleCxxSpecJSI_connect(jsi::Runtime &rt, TurboModule &turboModule, const jsi::Value* args, size_t count) {
  static_cast<NativeWebSocketSecureModuleCxxSpecJSI *>(&turboModule)->connect(rt, args[0].getString(rt), args[1].getObject(rt).getArray(rt), args[2].getObject(rt), args[3].getNumber());
  return jsi::Value::undefined();
}

static jsi::Value __hostFunction_NativeWebSocketSecureModuleCxxSpecJSI_send(jsi::Runtime &rt, TurboModule &turboModule, const jsi::Value* args, size_t count) {
  static_cast<NativeWebSocketSecureModuleCxxSpecJSI *>(&turboModule)->send(rt, args[0].getString(rt), args[1].getNumber());
  return jsi::Value::undefined();
}

static jsi::Value __hostFunction_NativeWebSocketSecureModuleCxxSpecJSI_sendBinary(jsi::Runtime &rt, TurboModule &turboModule, const jsi::Value* args, size_t count) {
  static_cast<NativeWebSocketSecureModuleCxxSpecJSI *>(&turboModule)->sendBinary(rt, args[0].getString(rt), args[1].getNumber());
  return jsi::Value::undefined();
}

static jsi::Value __hostFunction_NativeWebSocketSecureModuleCxxSpecJSI_ping(jsi::Runtime &rt, TurboModule &turboModule, const jsi::Value* args, size_t count) {
  static_cast<NativeWebSocketSecureModuleCxxSpecJSI *>(&turboModule)->ping(rt, args[0].getNumber());
  return jsi::Value::undefined();
}

static jsi::Value __hostFunction_NativeWebSocketSecureModuleCxxSpecJSI_close(jsi::Runtime &rt, TurboModule &turboModule, const jsi::Value* args, size_t count) {
  static_cast<NativeWebSocketSecureModuleCxxSpecJSI *>(&turboModule)->close(rt, args[0].getNumber(), args[1].getString(rt), args[2].getNumber());
  return jsi::Value::undefined();
}

static jsi::Value __hostFunction_NativeWebSocketSecureModuleCxxSpecJSI_addListener(jsi::Runtime &rt, TurboModule &turboModule, const jsi::Value* args, size_t count) {
  static_cast<NativeWebSocketSecureModuleCxxSpecJSI *>(&turboModule)->addListener(rt, args[0].getString(rt));
  return jsi::Value::undefined();
}

static jsi::Value __hostFunction_NativeWebSocketSecureModuleCxxSpecJSI_removeListeners(jsi::Runtime &rt, TurboModule &turboModule, const jsi::Value* args, size_t count) {
  static_cast<NativeWebSocketSecureModuleCxxSpecJSI *>(&turboModule)->removeListeners(rt, args[0].getNumber());
  return jsi::Value::undefined();
}

NativeWebSocketSecureModuleCxxSpecJSI::NativeWebSocketSecureModuleCxxSpecJSI(std::shared_ptr<CallInvoker> jsInvoker)
  : TurboModule("WebSocketSecureModule", jsInvoker) {
  methodMap_["connect"] = MethodMetadata {4, __hostFunction_NativeWebSocketSecureModuleCxxSpecJSI_connect};
  methodMap_["send"] = MethodMetadata {2, __hostFunction_NativeWebSocketSecureModuleCxxSpecJSI_send};
  methodMap_["sendBinary"] = MethodMetadata {2, __hostFunction_NativeWebSocketSecureModuleCxxSpecJSI_sendBinary};
  methodMap_["ping"] = MethodMetadata {1, __hostFunction_NativeWebSocketSecureModuleCxxSpecJSI_ping};
  methodMap_["close"] = MethodMetadata {3, __hostFunction_NativeWebSocketSecureModuleCxxSpecJSI_close};
  methodMap_["addListener"] = MethodMetadata {1, __hostFunction_NativeWebSocketSecureModuleCxxSpecJSI_addListener};
  methodMap_["removeListeners"] = MethodMetadata {1, __hostFunction_NativeWebSocketSecureModuleCxxSpecJSI_removeListeners};
}


} // namespace react
} // namespace facebook
