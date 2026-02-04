const base_code_logged_in = `
<div id="masthead-user" style="cursor: pointer;"><span id="masthead-gaia-user-expander" class="masthead-user-menu-expander masthead-expander">
    <span id="masthead-gaia-user-wrapper" class="yt-rounded" tabindex="0">yt2009_username</span>
    </span>
<span id="masthead-gaia-photo-expander" class="masthead-user-menu-expander masthead-expander">
<span id="masthead-gaia-photo-wrapper" class="yt-rounded">
<span id="masthead-gaia-user-image">
<span class="clip">
<span class="clip-center">
<img src="/assets/site-assets/new-hq-default.png" alt="">
<span class="vertical-center"></span>
</span>
</span>
</span>
<span class="masthead-expander-arrow"></span>
</span>
</span></div>
<script>
document.addEventListener('DOMContentLoaded', function() {
    const mastheadUser = document.getElementById('masthead-user');
    const mastheadExpanded = document.getElementById('masthead-expanded');
    
    if (mastheadUser && mastheadExpanded) {
        mastheadUser.addEventListener('click', function() {
            // Przełącz klasę 'hid' - usuwa jeśli istnieje, dodaje jeśli nie
            mastheadExpanded.classList.toggle('hid');
        });
    }
});
</script>
`


const base_code_logged_out = `<a class="start spf-link" href="/mh_pc_intro">lang_create_btn</a>    
        <span class="masthead-link-separator">|</span>  
        <a class="end" href="/mh_pc_manage">lang_sign_btn</a>`

module.exports = function(req, code, returnNoLang) {
    let flags = req.query && req.query.flags ? req.query.flags + ":" : ""
    try {
        req.headers.cookie.split(";").forEach(cookie => {
            if(cookie.trimStart().startsWith("global_flags")) {
                flags += cookie.trimStart().replace("global_flags=", "")
            }
        })
    }
    catch(error) {
        flags = req;
    }

    let loggedInUsername = false;

    try {
        flags = flags.split(";").join(":")
        flags.split(":").forEach(flag => {
            if(flag.includes("login_simulate")) {
                loggedInUsername = flag.split("login_simulate")[1];
            }
        })
    }
    catch(error) {
        // ej ej ej ale bez takich
        if(req.headers["user-agent"] == "Shockwave Flash") {
            return "";
        }
    }

    if(loggedInUsername) {
        loggedInUsername = require("./yt2009utils").asciify(
            decodeURIComponent(loggedInUsername), true, true
        ).substring(0, 20)
        if(loggedInUsername.length == 0) {
            loggedInUsername = "guest"
        }
        code = code.replace(
            "<!--yt2009_login_insert-->",
            base_code_logged_in.split("yt2009_username").join(
                loggedInUsername
            )
        )
    } else {
        code = code.replace("<!--yt2009_login_insert-->", base_code_logged_out)
    }

    // languages via hl param/lang cookie
    if(returnNoLang) {
        code = code.replace(`Sign Out`, "lang_signout_btn")
        code = code.replace(`Create Account`, "lang_create_btn")
        code = code.replace(`>or<`, ">lang_or<")
        code = code.replace(`Sign In`, "lang_sign_btn")
    }

    return code;
}