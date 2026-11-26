"use client";
import { jsxs as M, Fragment as U, jsx as F } from "react/jsx-runtime";
import { forwardRef as W, useRef as b, useState as O, useCallback as x, useEffect as P, useImperativeHandle as B } from "react";
const H = [
  "cdn.captcha-cdn.net",
  "cdn.captchala.com"
], q = 1e4, s = {
  loading: !1,
  loaded: !1,
  error: null,
  promise: null
};
function D(n, m, h = 0) {
  return new Promise((t, g) => {
    if (h >= n.length) {
      g(new Error("All CDN servers failed"));
      return;
    }
    const w = `https://${n[h]}${m}`, d = document.createElement("script");
    d.src = w, d.async = !0, d.crossOrigin = "anonymous";
    let c = !1, y;
    const p = (C = !1) => {
      c = !0, clearTimeout(y), d.onload = null, d.onerror = null, C && d.parentNode && d.parentNode.removeChild(d);
    };
    d.onload = () => {
      c || (p(!1), t());
    }, d.onerror = () => {
      c || (p(!0), D(n, m, h + 1).then(t).catch(g));
    }, y = setTimeout(() => {
      c || (p(!0), D(n, m, h + 1).then(t).catch(g));
    }, q), document.body.appendChild(d);
  });
}
function G(n, m) {
  const h = `https://${n[0]}${m}`;
  if (document.querySelector(`link[href="${h}"]`)) return;
  const t = document.createElement("link");
  t.rel = "stylesheet", t.href = h, t.crossOrigin = "anonymous", document.head.appendChild(t);
}
function A() {
  return s.loaded || window.Captchala ? (s.loaded = !0, Promise.resolve()) : (s.loading && s.promise || (s.loading = !0, s.promise = new Promise((n, m) => {
    if (G(H, "/captchala.css"), document.querySelector('script[src*="captchala.js"]')) {
      let t = 0;
      const g = q / 50, w = setInterval(() => {
        t++, window.Captchala ? (clearInterval(w), s.loaded = !0, s.loading = !1, n()) : t >= g && (clearInterval(w), s.loading = !1, s.error = new Error("SDK load timeout - script exists but SDK not initialized"), m(s.error));
      }, 50);
      return;
    }
    D(H, "/captchala.js").then(() => {
      s.loaded = !0, s.loading = !1, n();
    }).catch((t) => {
      s.loading = !1, s.error = t, m(t);
    });
  })), s.promise);
}
function Y() {
  return s.loaded || !!window.Captchala;
}
const J = W((n, m) => {
  const {
    appKey: h,
    product: t = "popup",
    action: g = "default",
    lang: w,
    bindTo: d,
    serverToken: c,
    theme: y,
    onServerTokenExpired: p,
    onSuccess: C,
    onExpired: T,
    onError: k,
    onClose: I,
    onReady: L,
    name: K,
    className: $,
    style: N
  } = n, r = b(null), e = b(null), [o, a] = O(""), i = b({ onSuccess: C, onExpired: T, onError: k, onClose: I, onReady: L, onServerTokenExpired: p });
  i.current = { onSuccess: C, onExpired: T, onError: k, onClose: I, onReady: L, onServerTokenExpired: p };
  const v = !!T, V = x(async () => {
    var l, S;
    try {
      if (await A(), !window.Captchala || !r.current) return;
      for (a(""), e.current && (e.current.destroy(), e.current = null); r.current.firstChild; )
        r.current.removeChild(r.current.firstChild);
      const E = window.Captchala.init({
        appKey: h,
        product: t,
        action: g,
        lang: w,
        theme: y,
        serverToken: c,
        // Delegates to props.onServerTokenExpired through a ref, so the closure never goes stale
        onServerTokenExpired: () => {
          var u, f;
          return ((f = (u = i.current).onServerTokenExpired) == null ? void 0 : f.call(u)) ?? null;
        }
      });
      E.onReady(() => {
        var u, f;
        return (f = (u = i.current).onReady) == null ? void 0 : f.call(u);
      }).onSuccess((u) => {
        var f, R;
        a((u == null ? void 0 : u.token) || ""), (R = (f = i.current).onSuccess) == null || R.call(f, u);
      }).onError((u) => {
        var f, R;
        a(""), (R = (f = i.current).onError) == null || R.call(f, u);
      }).onClose(() => {
        var u, f;
        return (f = (u = i.current).onClose) == null ? void 0 : f.call(u);
      }), v && typeof E.onExpired == "function" && E.onExpired(() => {
        var u, f;
        a(""), (f = (u = i.current).onExpired) == null || f.call(u);
      }), t === "bind" && d ? E.bindTo(d) : t !== "bind" && E.appendTo(r.current), e.current = E;
    } catch (E) {
      (S = (l = i.current).onError) == null || S.call(l, E);
    }
  }, [h, t, g, d, c, v]);
  P(() => {
    var l;
    (l = e.current) != null && l.setLang && e.current.setLang(w);
  }, [w]), B(m, () => ({
    verify: () => {
      var l;
      return (l = e.current) == null ? void 0 : l.verify();
    },
    reset: () => {
      var l;
      a(""), (l = e.current) == null || l.reset();
    },
    destroy: () => {
      var l;
      return (l = e.current) == null ? void 0 : l.destroy();
    },
    bindTo: (l) => {
      var S;
      return (S = e.current) == null ? void 0 : S.bindTo(l);
    },
    setLang: (l) => {
      var S, E;
      return (E = (S = e.current) == null ? void 0 : S.setLang) == null ? void 0 : E.call(S, l);
    },
    getInstance: () => e.current
  }), []), P(() => (V(), () => {
    e.current && (e.current.destroy(), e.current = null);
  }), [V]);
  const _ = t === "bind" ? { minHeight: 0, position: "absolute", width: 0, height: 0, overflow: "hidden", ...N } : { minHeight: 50, ...N }, z = /* @__PURE__ */ F(
    "div",
    {
      ref: r,
      className: $,
      style: _
    }
  );
  return K ? /* @__PURE__ */ M(U, { children: [
    z,
    /* @__PURE__ */ F("input", { type: "hidden", name: K, value: o })
  ] }) : z;
});
J.displayName = "Captchala";
function Z(n) {
  const [m, h] = O(!1), [t, g] = O(!0), [w, d] = O(null), c = b(null), y = b(null), p = b(null), C = b(!1), T = b(n.onExpired);
  T.current = n.onExpired;
  const k = !!n.onExpired;
  P(() => {
    let r = !0;
    async function e() {
      try {
        if (await A(), !r || !window.Captchala) return;
        const o = window.Captchala.init({
          appKey: n.appKey,
          product: n.product || "popup",
          action: n.action || "default",
          lang: n.lang,
          theme: n.theme
        });
        o.onReady(() => {
          r && (h(!0), g(!1));
        }).onSuccess((a) => {
          var i;
          C.current = !1, (i = y.current) == null || i.call(y, a), y.current = null, p.current = null;
        }).onError((a) => {
          var v;
          C.current = !1;
          let i;
          a instanceof Error ? i = a : typeof a == "string" ? i = new Error(a) : a && typeof a == "object" ? (i = new Error(a.message || a.error || "Verification failed"), i.cause = a) : i = new Error("Verification failed"), (v = p.current) == null || v.call(p, i), y.current = null, p.current = null;
        }), k && typeof o.onExpired == "function" && o.onExpired(() => {
          var a;
          return (a = T.current) == null ? void 0 : a.call(T);
        }), c.current = o;
      } catch (o) {
        r && (d(o), g(!1));
      }
    }
    return e(), () => {
      r = !1, c.current && (c.current.destroy(), c.current = null);
    };
  }, [n.appKey, n.product, n.action, k]), P(() => {
    var r;
    n.lang && ((r = c.current) != null && r.setLang) && c.current.setLang(n.lang);
  }, [n.lang]);
  const I = x(() => new Promise((r, e) => {
    if (!c.current) {
      e(new Error("Captcha not initialized"));
      return;
    }
    if (C.current) {
      e(new Error("Verification already in progress"));
      return;
    }
    C.current = !0, y.current = r, p.current = e;
    try {
      c.current.verify();
    } catch (o) {
      C.current = !1, y.current = null, p.current = null, e(o instanceof Error ? o : new Error(String((o == null ? void 0 : o.message) || o || "verify() failed")));
    }
  }), []), L = x(() => {
    var r;
    (r = c.current) == null || r.reset();
  }, []), K = x((r) => {
    var e;
    (e = c.current) == null || e.bindTo(r);
  }, []), $ = x((r) => {
    var e;
    (e = c.current) == null || e.appendTo(r);
  }, []), N = x((r) => {
    var e, o;
    (o = (e = c.current) == null ? void 0 : e.setLang) == null || o.call(e, r);
  }, []);
  return {
    ready: m,
    loading: t,
    error: w,
    verify: I,
    reset: L,
    bindTo: K,
    appendTo: $,
    setLang: N
  };
}
export {
  J as Captchala,
  J as default,
  Y as isCaptchalaLoaded,
  A as loadCaptchalaSDK,
  Z as useCaptchala
};
