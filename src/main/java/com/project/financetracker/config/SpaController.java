package com.project.financetracker.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // Matches client-side routes like /login, /dashboard, /transactions —
    // any single path segment with no dot in it (so it doesn't intercept
    // real asset requests like /assets/index-abc123.js or /favicon.ico).
    @RequestMapping(value = "/{path:[^\\.]*}")
    public String forwardRoot() {
        return "forward:/index.html";
    }

    // Same idea, for any nested client-side routes added later
    // (e.g. /settings/profile), not currently used but harmless to have.
    @RequestMapping(value = "/**/{path:[^\\.]*}")
    public String forwardNested() {
        return "forward:/index.html";
    }
}