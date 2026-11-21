import { jsx as H } from "react/jsx-runtime";
import { forwardRef as q, useRef as x, useCallback as k, useEffect as N, useImperativeHandle as A, useState as P } from "react";
const D = [
  "cdn.captcha-cdn.net",
  "cdn.captchala.com"
], V = 1e4, i = {
  loading: !1,
  loaded: !1,
  error: null,
  promise: null
};
function $(r, h, p = 0) {
  return new Promise((t, y) => {
    if (p >= r.length) {
      y(new Error("All CDN servers failed"));
      return;
    }
    const w = `https://${r[p]}${h}`, l = document.createElement("script");
    l.src = w, l.async = !0, l.crossOrigin = "anonymous";
    let a = !1, m;
    const f = (C = !1) => {
      a = !0, clearTimeout(m), l.onload = null, l.onerror = null, C && l.parentNode && l.parentNode.removeChild(l);
    };
    l.onload = () => {
      a || (f(!1), t());
    }, l.onerror = () => {
      a || (f(!0), $(r, h, p + 1).then(t).catch(y));
    }, m = setTimeout(() => {
      a || (f(!0), $(r, h, p + 1).then(t).catch(y));
    }, V), document.body.appendChild(l);
  });
}
function _(r, h) {
  const p = `https://${r[0]}${h}`;
  if (document.querySelector(`link[href="${p}"]`)) return;
  const t = document.createElement("link");
  t.rel = "stylesheet", t.href = p, t.crossOrigin = "anonymous", document.head.appendChild(t);
}
function z() {
  return i.loaded || window.Captchala ? (i.loaded = !0, Promise.resolve()) : (i.loading && i.promise || (i.loading = !0, i.promise = new Promise((r, h) => {
    if (_(D, "/captchala.css"), document.querySelector('script[src*="captchala.js"]')) {
      let t = 0;
      const y = V / 50, w = setInterval(() => {
        t++, window.Captchala ? (clearInterval(w), i.loaded = !0, i.loading = !1, r()) : t >= y && (clearInterval(w), i.loading = !1, i.error = new Error("SDK load timeout - script exists but SDK not initialized"), h(i.error));
      }, 50);
      return;
    }
    $(D, "/captchala.js").then(() => {
      i.loaded = !0, i.loading = !1, r();
    }).catch((t) => {
      i.loading = !1, i.error = t, h(t);
    });
  })), i.promise);
}
function W() {
  return i.loaded || !!window.Captchala;
}
const F = q((r, h) => {
  const {
    appKey: p,
    product: t = "popup",
    action: y = "default",
    lang: w,
    bindTo: l,
    serverToken: a,
    theme: m,
    onServerTokenExpired: f,
    onSuccess: C,
    onExpired: T,
    onError: R,
    onClose: I,
    onReady: L,
    className: O,
    style: K
  } = r, b = x(null), e = x(null), n = x({ onSuccess: C, onExpired: T, onError: R, onClose: I, onReady: L, onServerTokenExpired: f });
  n.current = { onSuccess: C, onExpired: T, onError: R, onClose: I, onReady: L, onServerTokenExpired: f };
  const o = !!T, u = k(async () => {
    var c, S;
    try {
      if (await z(), !window.Captchala || !b.current) return;
      for (e.current && (e.current.destroy(), e.current = null); b.current.firstChild; )
        b.current.removeChild(b.current.firstChild);
      const E = window.Captchala.init({
        appKey: p,
        product: t,
        action: y,
        lang: w,
        theme: m,
        serverToken: a,
        // SDK 调用时委派到 props.onServerTokenExpired (通过 ref, 避免闭包陈旧)
        onServerTokenExpired: () => {
          var d, s;
          return ((s = (d = n.current).onServerTokenExpired) == null ? void 0 : s.call(d)) ?? null;
        }
      });
      E.onReady(() => {
        var d, s;
        return (s = (d = n.current).onReady) == null ? void 0 : s.call(d);
      }).onSuccess((d) => {
        var s, v;
        return (v = (s = n.current).onSuccess) == null ? void 0 : v.call(s, d);
      }).onError((d) => {
        var s, v;
        return (v = (s = n.current).onError) == null ? void 0 : v.call(s, d);
      }).onClose(() => {
        var d, s;
        return (s = (d = n.current).onClose) == null ? void 0 : s.call(d);
      }), o && typeof E.onExpired == "function" && E.onExpired(() => {
        var d, s;
        return (s = (d = n.current).onExpired) == null ? void 0 : s.call(d);
      }), t === "bind" && l ? E.bindTo(l) : t !== "bind" && E.appendTo(b.current), e.current = E;
    } catch (E) {
      (S = (c = n.current).onError) == null || S.call(c, E);
    }
  }, [p, t, y, l, a, o]);
  N(() => {
    var c;
    (c = e.current) != null && c.setLang && e.current.setLang(w);
  }, [w]), A(h, () => ({
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
      var S;
      return (S = e.current) == null ? void 0 : S.bindTo(c);
    },
    setLang: (c) => {
      var S, E;
      return (E = (S = e.current) == null ? void 0 : S.setLang) == null ? void 0 : E.call(S, c);
    },
    getInstance: () => e.current
  }), []), N(() => (u(), () => {
    e.current && (e.current.destroy(), e.current = null);
  }), [u]);
  const g = t === "bind" ? { minHeight: 0, position: "absolute", width: 0, height: 0, overflow: "hidden", ...K } : { minHeight: 50, ...K };
  return /* @__PURE__ */ H(
    "div",
    {
      ref: b,
      className: O,
      style: g
    }
  );
});
F.displayName = "Captchala";
function B(r) {
  const [h, p] = P(!1), [t, y] = P(!0), [w, l] = P(null), a = x(null), m = x(null), f = x(null), C = x(!1), T = x(r.onExpired);
  T.current = r.onExpired;
  const R = !!r.onExpired;
  N(() => {
    let e = !0;
    async function n() {
      try {
        if (await z(), !e || !window.Captchala) return;
        const o = window.Captchala.init({
          appKey: r.appKey,
          product: r.product || "popup",
          action: r.action || "default",
          lang: r.lang,
          theme: r.theme
        });
        o.onReady(() => {
          e && (p(!0), y(!1));
        }).onSuccess((u) => {
          var g;
          C.current = !1, (g = m.current) == null || g.call(m, u), m.current = null, f.current = null;
        }).onError((u) => {
          var c;
          C.current = !1;
          let g;
          u instanceof Error ? g = u : typeof u == "string" ? g = new Error(u) : u && typeof u == "object" ? (g = new Error(u.message || u.error || "Verification failed"), g.cause = u) : g = new Error("Verification failed"), (c = f.current) == null || c.call(f, g), m.current = null, f.current = null;
        }), R && typeof o.onExpired == "function" && o.onExpired(() => {
          var u;
          return (u = T.current) == null ? void 0 : u.call(T);
        }), a.current = o;
      } catch (o) {
        e && (l(o), y(!1));
      }
    }
    return n(), () => {
      e = !1, a.current && (a.current.destroy(), a.current = null);
    };
  }, [r.appKey, r.product, r.action, R]), N(() => {
    var e;
    r.lang && ((e = a.current) != null && e.setLang) && a.current.setLang(r.lang);
  }, [r.lang]);
  const I = k(() => new Promise((e, n) => {
    if (!a.current) {
      n(new Error("Captcha not initialized"));
      return;
    }
    if (C.current) {
      n(new Error("Verification already in progress"));
      return;
    }
    C.current = !0, m.current = e, f.current = n;
    try {
      a.current.verify();
    } catch (o) {
      C.current = !1, m.current = null, f.current = null, n(o instanceof Error ? o : new Error(String((o == null ? void 0 : o.message) || o || "verify() failed")));
    }
  }), []), L = k(() => {
    var e;
    (e = a.current) == null || e.reset();
  }, []), O = k((e) => {
    var n;
    (n = a.current) == null || n.bindTo(e);
  }, []), K = k((e) => {
    var n;
    (n = a.current) == null || n.appendTo(e);
  }, []), b = k((e) => {
    var n, o;
    (o = (n = a.current) == null ? void 0 : n.setLang) == null || o.call(n, e);
  }, []);
  return {
    ready: h,
    loading: t,
    error: w,
    verify: I,
    reset: L,
    bindTo: O,
    appendTo: K,
    setLang: b
  };
}
export {
  F as Captchala,
  F as default,
  W as isCaptchalaLoaded,
  z as loadCaptchalaSDK,
  B as useCaptchala
};
