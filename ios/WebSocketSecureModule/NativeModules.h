
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <ReactCommon/TurboModule.h>

namespace facebook {
namespace react {

class JSI_EXPORT NativeWebSocketSecureModuleCxxSpecJSI : public TurboModule {
protected:
  NativeWebSocketSecureModuleCxxSpecJSI(std::shared_ptr<CallInvoker> jsInvoker);

public:
virtual void connect(jsi::Runtime &rt, const jsi::String &url, const jsi::Array &protocols, const jsi::Object &options, double socketID) = 0;
virtual void send(jsi::Runtime &rt, const jsi::String &message, double forSocketID) = 0;
virtual void sendBinary(jsi::Runtime &rt, const jsi::String &base64String, double forSocketID) = 0;
virtual void ping(jsi::Runtime &rt, double socketID) = 0;
virtual void close(jsi::Runtime &rt, double code, const jsi::String &reason, double socketID) = 0;
virtual void addListener(jsi::Runtime &rt, const jsi::String &eventName) = 0;
virtual void removeListeners(jsi::Runtime &rt, double count) = 0;

};

} // namespace react
} // namespace facebook
