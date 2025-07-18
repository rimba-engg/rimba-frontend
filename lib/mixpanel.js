import mixpanel from 'mixpanel-browser';
 
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
 
export const initMixpanel = () => {
  if (!MIXPANEL_TOKEN) {
    console.warn('Mixpanel token is missing! Check your .env file.');
    return;
  }
 
  mixpanel.init(
    MIXPANEL_TOKEN, 
    {
      autocapture: {
        pageview: "full-url",
        click: true, // click tracking enabled
        input: true,
        scroll: true,
        submit: true,
        capture_text_content: false,
      },
      record_sessions_percent: 50,
    }
  );
}