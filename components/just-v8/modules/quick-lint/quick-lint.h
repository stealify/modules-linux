#ifndef QUICK_LINT_JS_C_API_H
#define QUICK_LINT_JS_C_API_H

#include <stddef.h>

#if defined(__cplusplus)
extern "C" {
#endif

typedef enum qljs_language_options {
  qljs_language_options_jsx_bit = 1 << 0,
  qljs_language_options_typescript_bit = 1 << 1,
} qljs_language_options;
typedef enum qljs_severity {
  qljs_severity_error = 1,
  qljs_severity_warning = 2,
} qljs_severity;

typedef struct qljs_web_demo_document qljs_web_demo_document;
struct qljs_web_demo_diagnostic {
  const char* message;
  char code[6];  // null-terminated
  qljs_severity severity;
  // Offsets count UTF-16 code units.
  int begin_offset;
  int end_offset;
};
qljs_web_demo_document* qljs_web_demo_create_document(void);
void qljs_web_demo_destroy_document(qljs_web_demo_document*);
void qljs_web_demo_set_text(qljs_web_demo_document*, const void* text_utf_8,
                            size_t text_byte_count);
void qljs_web_demo_set_config_text(qljs_web_demo_document*,
                                   const void* text_utf_8,
                                   size_t text_byte_count);
void qljs_web_demo_set_language_options(qljs_web_demo_document*,
                                        qljs_language_options);
void qljs_web_demo_set_locale(qljs_web_demo_document*, const char* locale);
const qljs_web_demo_diagnostic* qljs_web_demo_lint(qljs_web_demo_document*);
const qljs_web_demo_diagnostic* qljs_web_demo_lint_as_config_file(
    qljs_web_demo_document*);

// Returns a null-terminated array of null-terminated strings.
const char* const* qljs_list_locales();

#if defined(__cplusplus)
}
#endif

#endif
