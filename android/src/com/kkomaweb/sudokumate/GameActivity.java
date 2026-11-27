package com.kkomaweb.sudokumate;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.cardemulation.CardEmulation;
import android.nfc.tech.IsoDep;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.*;
import android.widget.FrameLayout;
import java.io.*;
import java.nio.charset.StandardCharsets;

public final class GameActivity extends Activity {
    private static final String HOST = "xn--hq1b25zp3j.kro.kr";
    private static final String PAGE = "https://" + HOST + "/__mate/index.html";
    private static final String PREFIX = "/__mate/";
    private WebView web;
    private RewardAds ads;
    private NfcAdapter nfc;
    private String requested = "off";
    private boolean foreground, reading, preferred;

    private boolean pageReady;
    private String pendingRoom;

    private String inviteRoom(Intent intent) {
        Uri uri = intent.getData();
        if (!Intent.ACTION_VIEW.equals(intent.getAction()) || uri == null ||
            !"https".equals(uri.getScheme()) || !"/invite".equals(uri.getPath()) ||
            !(HOST.equals(uri.getHost()) || "스도쿠.kro.kr".equals(uri.getHost()))) return null;
        String code = uri.getQueryParameter("room");
        return code != null && code.matches("[0-9]{4}") ? code : null;
    }

    private void deliverInvite() {
        if (!pageReady || pendingRoom == null) return;
        String room = pendingRoom;
        pendingRoom = null;
        web.evaluateJavascript("receiveRoomInvite('" + room + "')", null);
    }

    @Override protected void onSaveInstanceState(Bundle state) {
        super.onSaveInstanceState(state);
        state.putString("inviteRoom", pendingRoom);
    }

    @Override protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String room = inviteRoom(intent);
        if (room != null) { pendingRoom = room; deliverInvite(); }
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        pendingRoom = state == null ? inviteRoom(getIntent()) : state.getString("inviteRoom");
        web = new WebView(this);
        int surface = Color.rgb(244,245,250);
        FrameLayout viewport = new FrameLayout(this);
        viewport.setBackgroundColor(surface);
        web.setBackgroundColor(surface);
        viewport.addView(web, new FrameLayout.LayoutParams(-1,-1));
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        if (android.os.Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            viewport.setOnApplyWindowInsetsListener((frame,insets)-> {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                frame.setPadding(bars.left,bars.top,bars.right,bars.bottom);
                return WindowInsets.CONSUMED;
            });
        }
        setContentView(viewport);
        viewport.requestApplyInsets();
        nfc = NfcAdapter.getDefaultAdapter(this);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                pageReady = PAGE.equals(url);
                deliverInvite();
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) { return true; }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri uri = req.getUrl();
                if (!"https".equals(uri.getScheme()) || !HOST.equals(uri.getHost())) return null;
                String path = uri.getPath();
                if (path == null || !path.startsWith(PREFIX)) return null;
                String name = path.substring(PREFIX.length());
                if (!name.contains("..") && name.matches("[a-zA-Z0-9_./-]+")) {
                    String type = name.endsWith(".js")?"text/javascript":name.endsWith(".css")?"text/css":name.endsWith(".png")?"image/png":name.endsWith(".webmanifest")?"application/manifest+json":"text/html";
                    try { return new WebResourceResponse(type, "UTF-8", getAssets().open(name)); }
                    catch(IOException missing) { /* Return a local 404. */ }
                }
                return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null, null);
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onJsPrompt(WebView view,String url,String msg,String value,JsPromptResult result) {
                if (PAGE.equals(url) && "sudoku:share".equals(msg) && value != null && value.matches("[0-9]{4}")) {
                    Intent share = new Intent(Intent.ACTION_SEND).setType("text/plain");
                    share.putExtra(Intent.EXTRA_TEXT, "https://스도쿠.kro.kr/invite?room=" + value);
                    try {
                        startActivity(Intent.createChooser(share, null));
                        result.confirm("ok");
                    } catch (ActivityNotFoundException unavailable) { result.confirm("off"); }
                    return true;
                }
                if(PAGE.equals(url) && "sudoku:reward".equals(msg)) { result.confirm(ads.request(value)?"ok":"off"); return true; }
                if(PAGE.equals(url) && "sudoku:privacy".equals(msg)) { result.confirm(ads.privacy(value)); return true; }
                if (!PAGE.equals(url) || !"sudoku:nfc".equals(msg)) { result.cancel(); return true; }
                requested = value != null && (value.matches("[0-9]{4}") || value.equals("read")) ? value : "off";
                applyMode();
                result.confirm(nfc != null && nfc.isEnabled() ? "on":"off");
                return true;
            }
        });
        ads = new RewardAds(this,web);
        web.loadUrl(PAGE);
        ads.prepareConsent();
    }

    private void applyMode() {
        RoomCard.openRoom = "";
        if (nfc == null) return;
        try {
            boolean enabled = foreground && nfc.isEnabled();
            boolean wantReader = enabled && requested.equals("read");
            boolean wantHost = enabled && requested.matches("[0-9]{4}") &&
                getPackageManager().hasSystemFeature(PackageManager.FEATURE_NFC_HOST_CARD_EMULATION);
            if (reading && !wantReader) { nfc.disableReaderMode(this); reading = false; }
            if (preferred && !wantHost) { CardEmulation.getInstance(nfc).unsetPreferredService(this); preferred = false; }
            if (wantReader && !reading) {
                nfc.enableReaderMode(this,this::readRoom,NfcAdapter.FLAG_READER_NFC_A | NfcAdapter.FLAG_READER_NFC_B | NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK,null);
                reading = true;
            }
            if (wantHost) {
                if (!preferred) preferred = CardEmulation.getInstance(nfc).setPreferredService(this,new ComponentName(this,RoomCard.class));
                RoomCard.openRoom = requested;
            }
        } catch (RuntimeException unavailable) { RoomCard.openRoom = ""; }
    }

    private void readRoom(Tag tag) {
        IsoDep card = IsoDep.get(tag);
        if (card == null) return;
        try {
            card.connect();
            card.setTimeout(800);
            byte[] reply = card.transceive(RoomCard.SELECT);
            if (reply.length != 6 || reply[4] != (byte)0x90 || reply[5] != 0) return;
            String code = new String(reply,0,4,StandardCharsets.US_ASCII);
            if (code.matches("[0-9]{4}")) runOnUiThread(()->{
                if (foreground && requested.equals("read") && PAGE.equals(web.getUrl()))
                    web.evaluateJavascript("receiveTapRoom('" + code + "')",null);
            });
        } catch(IOException ignored) { /* A phone can move away during the tap. */ }
        finally { try {card.close();} catch(IOException ignored) {} }
    }

    @Override protected void onResume() { super.onResume(); foreground=true; web.onResume(); web.evaluateJavascript("window.mateForeground && mateForeground(true)",null); applyMode(); }
    @Override protected void onPause() { foreground=false; web.evaluateJavascript("window.mateForeground && mateForeground(false)",null); applyMode(); web.onPause(); super.onPause(); }
    @Override protected void onDestroy() { web.destroy(); super.onDestroy(); }
    @Override public void onBackPressed() {
        web.evaluateJavascript("typeof mateBack==='function' && mateBack()",handled->{
            if (!"true".equals(handled)) super.onBackPressed();
        });
    }
}
