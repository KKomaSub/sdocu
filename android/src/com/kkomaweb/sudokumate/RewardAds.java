package com.kkomaweb.sudokumate;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;
import com.google.android.gms.ads.*;
import com.google.android.gms.ads.rewarded.*;
import com.google.android.ump.*;

final class RewardAds {
    private static final String HINT = "ca-app-pub-3436035126711278/6691952614";
    private static final String REVIVE = "ca-app-pub-3436035126711278/8796417957";
    private static final String TEST = "ca-app-pub-3940256099942544/5224354917";
    private final Activity activity;
    private final WebView web;
    private final ConsentInformation consent;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean initializing, initialized, presenting;
    private String pending = "";

    RewardAds(Activity activity, WebView web) {
        this.activity=activity;
        this.web=web;
        consent=UserMessagingPlatform.getConsentInformation(activity);
    }
    void prepareConsent() {
        consent.requestConsentInfoUpdate(activity,new ConsentRequestParameters.Builder().build(),
            ()->UserMessagingPlatform.loadAndShowConsentFormIfRequired(activity,error->initialize()),
            error->initialize());
    }
    private void initialize() {
        if (!consent.canRequestAds() || initialized || initializing) return;
        initializing=true;
        MobileAds.initialize(activity,status->activity.runOnUiThread(()->{initialized=true;initializing=false;}));
    }
    String privacy(String command) {
        boolean needed=consent.getPrivacyOptionsRequirementStatus()==ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED;
        if (needed && "show".equals(command)) UserMessagingPlatform.showPrivacyOptionsForm(activity,error->initialize());
        return needed?"required":"off";
    }
    boolean request(String request) {
        if (request==null || !pending.isEmpty() || !consent.canRequestAds()) return false;
        String[] parts=request.split("\\|",-1);
        if (parts.length!=2 || !(parts[0].equals("revive") || parts[0].equals("hint")) ||
            !parts[1].matches("[0-9a-fA-F-]{36}")) return false;
        if (!initialized) { initialize(); return false; }
        final String token=parts[1];
        pending=token;
        String unit=BuildConfig.DEBUG?TEST:parts[0].equals("revive")?REVIVE:HINT;
        handler.postDelayed(()->{if(!presenting)finish(token,"unavailable");},45000);
        RewardedAd.load(activity,unit,new AdRequest.Builder().build(),new RewardedAdLoadCallback(){
            @Override public void onAdFailedToLoad(LoadAdError error){finish(token,"unavailable");}
            @Override public void onAdLoaded(RewardedAd ad){
                if(!token.equals(pending) || activity.isDestroyed())return;
                web.evaluateJavascript("mateAdStillValid('"+token+"')",valid->{
                    if(!token.equals(pending))return;
                    if(!"true".equals(valid) || !activity.hasWindowFocus()){finish(token,"unavailable");return;}
                    presenting=true;
                    final boolean[] earned={false};
                    ad.setFullScreenContentCallback(new FullScreenContentCallback(){
                        @Override public void onAdDismissedFullScreenContent(){finish(token,earned[0]?"earned":"closed");}
                        @Override public void onAdFailedToShowFullScreenContent(AdError error){finish(token,"unavailable");}
                    });
                    ad.show(activity,reward->earned[0]=true);
                });
            }
        });
        return true;
    }
    private void finish(String token,String result){
        if(!token.equals(pending))return;
        pending="";presenting=false;
        if(!activity.isDestroyed())web.evaluateJavascript("mateAdResult('"+token+"','"+result+"')",null);
    }
}
