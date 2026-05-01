import { jsx as D } from "react/jsx-runtime";
import { forwardRef as V, useRef as T, useCallback as b, useEffect as L, useImperativeHandle as H, useState as N } from "react";
const z = [
  "cdn.captcha-cdn.net",
  "cdn.captchala.com"
], P = 1e4, o = {
  loading: !1,
  loaded: !1,
  error: null,
  promise: null
};
function x(t, m, d = 0) {
  return new Promise((a, g) => {
    if (d >= t.length) {
      g(new Error("All CDN servers failed"));
      return;
    }
    const C = `https://${t[d]}${m}`, l = document.createElement("script");
    l.src = C, l.async = !0, l.crossOrigin = "anonymous";
    let c = !1, f;
    const u = (w = !1) => {
      c = !0, clearTimeout(f), l.onload = null, l.onerror = null, w && l.parentNode && l.parentNode.removeChild(l);
    };
    l.onload = () => {
      c || (u(!1), a());
    }, l.onerror = () => {
      c || (u(!0), x(t, m, d + 1).then(a).catch(g));
    }, f = setTimeout(() => {
      c || (u(!0), x(t, m, d + 1).then(a).catch(g));
    }, P), document.body.appendChild(l);
  });
}
function O(t, m) {
  const d = `https://${t[0]}${m}`;
  if (document.querySelector(`link[href="${d}"]`)) return;
  const a = document.createElement("link");
  a.rel = "stylesheet", a.href = d, a.crossOrigin = "anonymous", document.head.appendChild(a);
}
function $() {
  return o.loaded || window.Captchala ? (o.loaded = !0, Promise.resolve()) : (o.loading && o.promise || (o.loading = !0, o.promise = new Promise((t, m) => {
    if (O(z, "/captchala.css"), document.querySelector('script[src*="captchala.js"]')) {
      let a = 0;
      const g = P / 50, C = setInterval(() => {
        a++, window.Captchala ? (clearInterval(C), o.loaded = !0, o.loading = !1, t()) : a >= g && (clearInterval(C), o.loading = !1, o.error = new Error("SDK load timeout - script exists but SDK not initialized"), m(o.error));
      }, 50);
      return;
    }
    x(z, "/captchala.js").then(() => {
      o.loaded = !0, o.loading = !1, t();
    }).catch((a) => {
      o.loading = !1, o.error = a, m(a);
    });
  })), o.promise);
}
function F() {
  return o.loaded || !!window.Captchala;
}
const q = V((t, m) => {
  const {
    appKey: d,
    product: a = "popup",
    action: g = "default",
    lang: C = "zh-CN",
    bindTo: l,
    serverToken: c,
    onServerTokenExpired: f,
    onSuccess: u,
    onError: w,
    onClose: k,
    onReady: v,
    className: K,
    style: I
  } = t, S = T(null), e = T(null), n = T({ onSuccess: u, onError: w, onClose: k, onReady: v, onServerTokenExpired: f });
  n.current = { onSuccess: u, onError: w, onClose: k, onReady: v, onServerTokenExpired: f };
  const i = b(async () => {
    var r, h;
    try {
      if (await $(), !window.Captchala || !S.current) return;
      for (e.current && (e.current.destroy(), e.current = null); S.current.firstChild; )
        S.current.removeChild(S.current.firstChild);
      const E = window.Captchala.init({
        appKey: d,
        product: a,
        action: g,
        lang: C,
        serverToken: c,
        // SDK 调用时委派到 props.onServerTokenExpired (通过 ref, 避免闭包陈旧)
        onServerTokenExpired: () => {
          var y, s;
          return ((s = (y = n.current).onServerTokenExpired) == null ? void 0 : s.call(y)) ?? null;
        }
      });
      E.onReady(() => {
        var y, s;
        return (s = (y = n.current).onReady) == null ? void 0 : s.call(y);
      }).onSuccess((y) => {
        var s, R;
        return (R = (s = n.current).onSuccess) == null ? void 0 : R.call(s, y);
      }).onError((y) => {
        var s, R;
        return (R = (s = n.current).onError) == null ? void 0 : R.call(s, y);
      }).onClose(() => {
        var y, s;
        return (s = (y = n.current).onClose) == null ? void 0 : s.call(y);
      }), a === "bind" && l ? E.bindTo(l) : a !== "bind" && E.appendTo(S.current), e.current = E;
    } catch (E) {
      (h = (r = n.current).onError) == null || h.call(r, E);
    }
  }, [d, a, g, l, c]);
  L(() => {
    var r;
    (r = e.current) != null && r.setLang && e.current.setLang(C);
  }, [C]), H(m, () => ({
    verify: () => {
      var r;
      return (r = e.current) == null ? void 0 : r.verify();
    },
    reset: () => {
      var r;
      return (r = e.current) == null ? void 0 : r.reset();
    },
    destroy: () => {
      var r;
      return (r = e.current) == null ? void 0 : r.destroy();
    },
    bindTo: (r) => {
      var h;
      return (h = e.current) == null ? void 0 : h.bindTo(r);
    },
    setLang: (r) => {
      var h, E;
      return (E = (h = e.current) == null ? void 0 : h.setLang) == null ? void 0 : E.call(h, r);
    },
    getInstance: () => e.current
  }), []), L(() => (i(), () => {
    e.current && (e.current.destroy(), e.current = null);
  }), [i]);
  const p = a === "bind" ? { minHeight: 0, position: "absolute", width: 0, height: 0, overflow: "hidden", ...I } : { minHeight: 50, ...I };
  return /* @__PURE__ */ D(
    "div",
    {
      ref: S,
      className: K,
      style: p
    }
  );
});
q.displayName = "Captchala";
function M(t) {
  const [m, d] = N(!1), [a, g] = N(!0), [C, l] = N(null), c = T(null), f = T(null), u = T(null), w = T(!1);
  L(() => {
    let e = !0;
    async function n() {
      try {
        if (await $(), !e || !window.Captchala) return;
        const i = window.Captchala.init({
          appKey: t.appKey,
          product: t.product || "popup",
          action: t.action || "default",
          lang: t.lang || "zh-CN"
        });
        i.onReady(() => {
          e && (d(!0), g(!1));
        }).onSuccess((p) => {
          var r;
          w.current = !1, (r = f.current) == null || r.call(f, p), f.current = null, u.current = null;
        }).onError((p) => {
          var h;
          w.current = !1;
          let r;
          p instanceof Error ? r = p : typeof p == "string" ? r = new Error(p) : p && typeof p == "object" ? (r = new Error(p.message || p.error || "Verification failed"), r.cause = p) : r = new Error("Verification failed"), (h = u.current) == null || h.call(u, r), f.current = null, u.current = null;
        }), c.current = i;
      } catch (i) {
        e && (l(i), g(!1));
      }
    }
    return n(), () => {
      e = !1, c.current && (c.current.destroy(), c.current = null);
    };
  }, [t.appKey, t.product, t.action]), L(() => {
    var e;
    t.lang && ((e = c.current) != null && e.setLang) && c.current.setLang(t.lang);
  }, [t.lang]);
  const k = b(() => new Promise((e, n) => {
    if (!c.current) {
      n(new Error("Captcha not initialized"));
      return;
    }
    if (w.current) {
      n(new Error("Verification already in progress"));
      return;
    }
    w.current = !0, f.current = e, u.current = n;
    try {
      c.current.verify();
    } catch (i) {
      w.current = !1, f.current = null, u.current = null, n(i instanceof Error ? i : new Error(String((i == null ? void 0 : i.message) || i || "verify() failed")));
    }
  }), []), v = b(() => {
    var e;
    (e = c.current) == null || e.reset();
  }, []), K = b((e) => {
    var n;
    (n = c.current) == null || n.bindTo(e);
  }, []), I = b((e) => {
    var n;
    (n = c.current) == null || n.appendTo(e);
  }, []), S = b((e) => {
    var n, i;
    (i = (n = c.current) == null ? void 0 : n.setLang) == null || i.call(n, e);
  }, []);
  return {
    ready: m,
    loading: a,
    error: C,
    verify: k,
    reset: v,
    bindTo: K,
    appendTo: I,
    setLang: S
  };
}
export {
  q as Captchala,
  q as default,
  F as isCaptchalaLoaded,
  $ as loadCaptchalaSDK,
  M as useCaptchala
};
