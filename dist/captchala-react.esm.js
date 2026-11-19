import { jsx as z } from "react/jsx-runtime";
import { forwardRef as H, useRef as T, useCallback as b, useEffect as K, useImperativeHandle as O, useState as N } from "react";
const $ = [
  "cdn.captcha-cdn.net",
  "cdn.captchala.com"
], D = 1e4, l = {
  loading: !1,
  loaded: !1,
  error: null,
  promise: null
};
function P(n, p, f = 0) {
  return new Promise((t, y) => {
    if (f >= n.length) {
      y(new Error("All CDN servers failed"));
      return;
    }
    const w = `https://${n[f]}${p}`, i = document.createElement("script");
    i.src = w, i.async = !0, i.crossOrigin = "anonymous";
    let o = !1, h;
    const u = (C = !1) => {
      o = !0, clearTimeout(h), i.onload = null, i.onerror = null, C && i.parentNode && i.parentNode.removeChild(i);
    };
    i.onload = () => {
      o || (u(!1), t());
    }, i.onerror = () => {
      o || (u(!0), P(n, p, f + 1).then(t).catch(y));
    }, h = setTimeout(() => {
      o || (u(!0), P(n, p, f + 1).then(t).catch(y));
    }, D), document.body.appendChild(i);
  });
}
function q(n, p) {
  const f = `https://${n[0]}${p}`;
  if (document.querySelector(`link[href="${f}"]`)) return;
  const t = document.createElement("link");
  t.rel = "stylesheet", t.href = f, t.crossOrigin = "anonymous", document.head.appendChild(t);
}
function V() {
  return l.loaded || window.Captchala ? (l.loaded = !0, Promise.resolve()) : (l.loading && l.promise || (l.loading = !0, l.promise = new Promise((n, p) => {
    if (q($, "/captchala.css"), document.querySelector('script[src*="captchala.js"]')) {
      let t = 0;
      const y = D / 50, w = setInterval(() => {
        t++, window.Captchala ? (clearInterval(w), l.loaded = !0, l.loading = !1, n()) : t >= y && (clearInterval(w), l.loading = !1, l.error = new Error("SDK load timeout - script exists but SDK not initialized"), p(l.error));
      }, 50);
      return;
    }
    P($, "/captchala.js").then(() => {
      l.loaded = !0, l.loading = !1, n();
    }).catch((t) => {
      l.loading = !1, l.error = t, p(t);
    });
  })), l.promise);
}
function M() {
  return l.loaded || !!window.Captchala;
}
const A = H((n, p) => {
  const {
    appKey: f,
    product: t = "popup",
    action: y = "default",
    lang: w,
    bindTo: i,
    serverToken: o,
    theme: h,
    onServerTokenExpired: u,
    onSuccess: C,
    onError: k,
    onClose: v,
    onReady: I,
    className: x,
    style: L
  } = n, r = T(null), e = T(null), a = T({ onSuccess: C, onError: k, onClose: v, onReady: I, onServerTokenExpired: u });
  a.current = { onSuccess: C, onError: k, onClose: v, onReady: I, onServerTokenExpired: u };
  const s = b(async () => {
    var c, E;
    try {
      if (await V(), !window.Captchala || !r.current) return;
      for (e.current && (e.current.destroy(), e.current = null); r.current.firstChild; )
        r.current.removeChild(r.current.firstChild);
      const S = window.Captchala.init({
        appKey: f,
        product: t,
        action: y,
        lang: w,
        theme: h,
        serverToken: o,
        // SDK 调用时委派到 props.onServerTokenExpired (通过 ref, 避免闭包陈旧)
        onServerTokenExpired: () => {
          var m, d;
          return ((d = (m = a.current).onServerTokenExpired) == null ? void 0 : d.call(m)) ?? null;
        }
      });
      S.onReady(() => {
        var m, d;
        return (d = (m = a.current).onReady) == null ? void 0 : d.call(m);
      }).onSuccess((m) => {
        var d, R;
        return (R = (d = a.current).onSuccess) == null ? void 0 : R.call(d, m);
      }).onError((m) => {
        var d, R;
        return (R = (d = a.current).onError) == null ? void 0 : R.call(d, m);
      }).onClose(() => {
        var m, d;
        return (d = (m = a.current).onClose) == null ? void 0 : d.call(m);
      }), t === "bind" && i ? S.bindTo(i) : t !== "bind" && S.appendTo(r.current), e.current = S;
    } catch (S) {
      (E = (c = a.current).onError) == null || E.call(c, S);
    }
  }, [f, t, y, i, o]);
  K(() => {
    var c;
    (c = e.current) != null && c.setLang && e.current.setLang(w);
  }, [w]), O(p, () => ({
    verify: () => {
      var c;
      return (c = e.current) == null ? void 0 : c.verify();
    },
    reset: () => {
      var c;
      return (c = e.current) == null ? void 0 : c.reset();
    },
    destroy: () => {
      var c;
      return (c = e.current) == null ? void 0 : c.destroy();
    },
    bindTo: (c) => {
      var E;
      return (E = e.current) == null ? void 0 : E.bindTo(c);
    },
    setLang: (c) => {
      var E, S;
      return (S = (E = e.current) == null ? void 0 : E.setLang) == null ? void 0 : S.call(E, c);
    },
    getInstance: () => e.current
  }), []), K(() => (s(), () => {
    e.current && (e.current.destroy(), e.current = null);
  }), [s]);
  const g = t === "bind" ? { minHeight: 0, position: "absolute", width: 0, height: 0, overflow: "hidden", ...L } : { minHeight: 50, ...L };
  return /* @__PURE__ */ z(
    "div",
    {
      ref: r,
      className: x,
      style: g
    }
  );
});
A.displayName = "Captchala";
function U(n) {
  const [p, f] = N(!1), [t, y] = N(!0), [w, i] = N(null), o = T(null), h = T(null), u = T(null), C = T(!1);
  K(() => {
    let r = !0;
    async function e() {
      try {
        if (await V(), !r || !window.Captchala) return;
        const a = window.Captchala.init({
          appKey: n.appKey,
          product: n.product || "popup",
          action: n.action || "default",
          lang: n.lang,
          theme: n.theme
        });
        a.onReady(() => {
          r && (f(!0), y(!1));
        }).onSuccess((s) => {
          var g;
          C.current = !1, (g = h.current) == null || g.call(h, s), h.current = null, u.current = null;
        }).onError((s) => {
          var c;
          C.current = !1;
          let g;
          s instanceof Error ? g = s : typeof s == "string" ? g = new Error(s) : s && typeof s == "object" ? (g = new Error(s.message || s.error || "Verification failed"), g.cause = s) : g = new Error("Verification failed"), (c = u.current) == null || c.call(u, g), h.current = null, u.current = null;
        }), o.current = a;
      } catch (a) {
        r && (i(a), y(!1));
      }
    }
    return e(), () => {
      r = !1, o.current && (o.current.destroy(), o.current = null);
    };
  }, [n.appKey, n.product, n.action]), K(() => {
    var r;
    n.lang && ((r = o.current) != null && r.setLang) && o.current.setLang(n.lang);
  }, [n.lang]);
  const k = b(() => new Promise((r, e) => {
    if (!o.current) {
      e(new Error("Captcha not initialized"));
      return;
    }
    if (C.current) {
      e(new Error("Verification already in progress"));
      return;
    }
    C.current = !0, h.current = r, u.current = e;
    try {
      o.current.verify();
    } catch (a) {
      C.current = !1, h.current = null, u.current = null, e(a instanceof Error ? a : new Error(String((a == null ? void 0 : a.message) || a || "verify() failed")));
    }
  }), []), v = b(() => {
    var r;
    (r = o.current) == null || r.reset();
  }, []), I = b((r) => {
    var e;
    (e = o.current) == null || e.bindTo(r);
  }, []), x = b((r) => {
    var e;
    (e = o.current) == null || e.appendTo(r);
  }, []), L = b((r) => {
    var e, a;
    (a = (e = o.current) == null ? void 0 : e.setLang) == null || a.call(e, r);
  }, []);
  return {
    ready: p,
    loading: t,
    error: w,
    verify: k,
    reset: v,
    bindTo: I,
    appendTo: x,
    setLang: L
  };
}
export {
  A as Captchala,
  A as default,
  M as isCaptchalaLoaded,
  V as loadCaptchalaSDK,
  U as useCaptchala
};
