void just::qiclint::Close(const FunctionCallbackInfo<Value> &args) {

}

void just::qiclint::Init(Isolate* isolate, Local<ObjectTemplate> target) {
  Local<ObjectTemplate> module = ObjectTemplate::New(isolate);
  SET_METHOD(isolate, module, "qiclint", CreateConfig);
}
