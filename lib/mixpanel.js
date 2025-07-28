import mixpanel from 'mixpanel-browser';
 
const NEXT_PUBLIC_MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
console.log('NEXT_PUBLIC_MIXPANEL_TOKEN', NEXT_PUBLIC_MIXPANEL_TOKEN);
 
export const initMixpanel = () => {
  if (!NEXT_PUBLIC_MIXPANEL_TOKEN) {
    console.warn('Mixpanel token is missing! Check your .env file.');
    return;
  }
 
  mixpanel.init(
    NEXT_PUBLIC_MIXPANEL_TOKEN, 
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

// Track project/site dropdown changes
export const trackProjectChange = (userId, userEmail, customerName, fromSite, toSite) => {
  if (!NEXT_PUBLIC_MIXPANEL_TOKEN || typeof mixpanel === 'undefined' || !mixpanel.track) {
    console.warn('Mixpanel not initialized, skipping project change tracking');
    return;
  }

  try {
    mixpanel.track('Project Dropdown Changed', {
      distinct_id: userId,
      user_email: userEmail,
      customer_name: customerName,
      from_site: fromSite,
      to_site: toSite,
      module: 'Navigation',
      action_type: 'change',
      event_category: 'user_interaction',
      timestamp: new Date().toISOString()
    });
    
    console.log(`Mixpanel: Tracked project change from ${fromSite} to ${toSite} for user ${userEmail}`);
  } catch (error) {
    console.error('Error tracking project change in Mixpanel:', error);
  }
};

// Track how often users access the project dropdown (open it)
export const trackProjectDropdownOpen = (userId, userEmail, customerName, availableSites) => {
  if (!NEXT_PUBLIC_MIXPANEL_TOKEN || typeof mixpanel === 'undefined' || !mixpanel.track) {
    console.warn('Mixpanel not initialized, skipping dropdown open tracking');
    return;
  }

  try {
    mixpanel.track('Project Dropdown Opened', {
      user_id: userId,
      user_email: userEmail,
      customer_name: customerName,
      available_sites_count: availableSites?.length || 0,
      available_sites: availableSites,
      module: 'Navigation',
      action_type: 'open',
      event_category: 'user_interaction',
      timestamp: new Date().toISOString()
    });
    
    console.log(`Mixpanel: Tracked project dropdown open for user ${userEmail}`);
  } catch (error) {
    console.error('Error tracking project dropdown open in Mixpanel:', error);
  }
};

// Track customer selection changes (for completeness)
export const trackCustomerChange = (userId, userEmail, fromCustomer, toCustomer) => {
  if (!NEXT_PUBLIC_MIXPANEL_TOKEN || typeof mixpanel === 'undefined' || !mixpanel.track) {
    console.warn('Mixpanel not initialized, skipping customer change tracking');
    return;
  }

  try {
    mixpanel.track('Customer Selection Changed', {
      user_id: userId,
      user_email: userEmail,
      from_customer: fromCustomer,
      to_customer: toCustomer,
      module: 'Authentication',
      action_type: 'change',
      event_category: 'user_interaction',
      timestamp: new Date().toISOString()
    });
    
    console.log(`Mixpanel: Tracked customer change from ${fromCustomer} to ${toCustomer} for user ${userEmail}`);
  } catch (error) {
    console.error('Error tracking customer change in Mixpanel:', error);
  }
};