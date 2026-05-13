"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ml' | 'ta' | 'hi';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const dictionary: Translations = {
  // Navigation
  dashboard: { en: 'Dashboard', ml: 'ഡാഷ്ബോർഡ്', ta: 'டேஷ்போர்டு', hi: 'डैशबोर्ड' },
  report_net: { en: 'Report Net', ml: 'വല റിപ്പോർട്ട് ചെയ്യുക', ta: 'வலையைப் புகாரளிக்கவும்', hi: 'जाल की रिपोर्ट करें' },
  retrievals: { en: 'Retrievals', ml: 'വീണ്ടെടുക്കലുകൾ', ta: 'மீட்டெடுப்புகள்', hi: 'पुनर्प्राप्ति' },
  archive: { en: 'Archive', ml: 'ആർക്കൈവ്', ta: 'காப்பகம்', hi: 'संग्रह' },
  settings: { en: 'Settings', ml: 'ക്രമീകരണങ്ങൾ', ta: 'அமைப்புகள்', hi: 'सेटिंग्स' },
  notifications: { en: 'Notifications', ml: 'അറിയിപ്പുകൾ', ta: 'അറിയിപ്പുകൾ', hi: 'सूचनाएं' },
  logout: { en: 'Logout', ml: 'പുറത്തുകടക്കുക', ta: 'வெளியேறு', hi: 'लॉग आउट' },
  
  // Dashboard / General
  command_center: { en: 'Command Center', ml: 'കമാൻഡ് സെന്റർ', ta: 'கட்டளை மையம்', hi: 'कमांड सेंटर' },
  situational_awareness: { en: 'Real-time situational awareness for marine safety.', ml: 'സമുദ്ര സുരക്ഷയ്ക്കായുള്ള തത്സമയ സാഹചര്യ അവബോധം.', ta: 'கடல் பாதுகாப்பிற்கான நிகழ்நேர சூழ்நிலை விழிப்புணர்வு.', hi: 'समुद्री सुरक्षा के लिए वास्तविक समय की स्थितिजन्य जागरूकता।' },
  in_progress: { en: 'In Progress', ml: 'പുരോഗമിക്കുന്നു', ta: 'நடைபெறுகிறது', hi: 'प्रगति में है' },
  vessels: { en: 'Nearby Vessels', ml: 'സമീപത്തുള്ള കപ്പലുകൾ', ta: 'அருகிலுள்ள கப்பல்கள்', hi: 'आस-पास के जहाज' },
  alerts: { en: 'Real-time Alerts', ml: 'തത്സമയ മുന്നറിയിപ്പുകൾ', ta: 'நிகழ்நேர விழிப்பூட்டல்கள்', hi: 'वास्तविक समय अलर्ट' },
  active_missions: { en: 'Active Missions', ml: 'സജീവ ദൗത്യങ്ങൾ', ta: 'செயலில் உள்ள பணிகள்', hi: 'सक्रिय मिशन' },
  no_critical_threats: { en: 'No critical threats', ml: 'ഗുരുതരമായ ഭീഷണികളില്ല', ta: 'முக்கியமான அச்சுறுத்தல்கள் இல்லை', hi: 'कोई गंभीर खतरा नहीं' },
  live_ais_feed: { en: 'Live AIS Feed', ml: 'തത്സമയ AIS ഫീഡ്', ta: 'நேரடி AIS ஊட்டம்', hi: 'लाइव एआईएस फीड' },
  active_hazards: { en: 'Active Hazards', ml: 'സജീവമായ അപകടങ്ങൾ', ta: 'செயலில் உள்ள அபாயங்கள்', hi: 'सक्रिय खतरे' },
  missions_completed: { en: 'Missions Completed', ml: 'പൂർത്തിയാക്കിയ ദൗത്യങ്ങൾ', ta: 'பணிகள் முடிந்தது', hi: 'मिशन पूरे हुए' },
  certified_retrievals: { en: 'Certified Retrievals', ml: 'സാക്ഷ്യപ്പെടുത്തിയ വീണ്ടെടുക്കലുകൾ', ta: 'சான்றளிக்கப்பட்ட மீட்டெடுப்புகள்', hi: 'प्रमाणित पुनर्प्राप्ति' },
  
  // Archive & Reports
  retrieved_archive: { en: 'Retrieved Archive', ml: 'ശേഖരിക്കപ്പെട്ട ആർക്കൈവ്', ta: 'மீட்டெடுக்கப்பட்ட காப்பகம்', hi: 'पुनर्प्राप्त संग्रह' },
  historical_record: { en: 'Historical record of successful recovery missions.', ml: 'വിജയകരമായ വീണ്ടെടുക്കൽ ദൗത്യങ്ങളുടെ ചരിത്രരേഖ.', ta: 'வெற்றிகரமான மீட்புப் பணிகளின் வரலாற்றுப் பதிவு.', hi: 'सफल पुनर्प्राप्ति मिशनों का ऐतिहासिक रिकॉर्ड।' },
  historical_reports: { en: 'Historical Reports', ml: 'ചരിത്രപരമായ റിപ്പോർട്ടുകൾ', ta: 'வரலாற்று அறிக்கைகள்', hi: 'ऐतिहासिक रिपोर्ट' },
  hazard_id: { en: 'Hazard ID', ml: 'അപകട ഐഡി', ta: 'அபாய ஐடி', hi: 'खतरा आईडी' },
  net_type: { en: 'Net Type', ml: 'വലയുടെ തരം', ta: 'வலை வகை', hi: 'जाल का प्रकार' },
  location: { en: 'Location', ml: 'സ്ഥലം', ta: 'இடம்', hi: 'स्थान' },
  retrieved_by: { en: 'Retrieved By', ml: 'വീണ്ടെടുത്തത്', ta: 'மீட்டெடுத்தவர்', hi: 'किसके द्वारा पुनर्प्राप्त' },
  verification: { en: 'Verification', ml: 'പരിശോധന', ta: 'சரிபார்ப்பு', hi: 'சत्यापन' },
  report: { en: 'Report', ml: 'റിപ്പോർട്ട്', ta: 'அறிக்கை', hi: 'रिपोर्ट' },
  load_more_missions: { en: 'Load More Missions', ml: 'കൂടുതൽ ദൗത്യങ്ങൾ കാണുക', ta: 'கூடுதல் பணிகளை ஏற்றவும்', hi: 'अधिक मिशन लोड करें' },
  no_archived_missions: { en: 'No archived missions found', ml: 'ആർക്കൈവ് ചെയ്ത ദൗത്യങ്ങളൊന്നും കണ്ടെത്തിയില്ല', ta: 'காப்பகப்படுத்தப்பட்ட பணிகள் எதுவும் கிடைக்கவில்லை', hi: 'कोई संग्रहित मिशन नहीं मिला' },
  retrieval: { en: 'Retrieval', ml: 'വീണ്ടെടുക്കൽ', ta: 'மீட்பு', hi: 'पुनर्प्राप्ति' },
  certificate: { en: 'Certificate', ml: 'സർട്ടിഫിക്കറ്റ്', ta: 'சான்றிதழ்', hi: 'प्रमाणपत्र' },
  verified_specialist: { en: 'Verified Specialist', ml: 'പരിശോധിച്ചുറപ്പിച്ച വിദഗ്ദ്ധൻ', ta: 'சரிபார்க்கப்பட்ட நிபுணர்', hi: 'सत्यापित विशेषज्ञ' },
  credential_id: { en: 'Credential ID', ml: 'ക്രെഡൻഷ്യൽ ഐഡി', ta: 'சான்றளிப்பு ஐடி', hi: 'क्रेडेंशियल आईडी' },
  
  // Reporting Page
  issue_hazard_report: { en: 'Issue Hazard Report', ml: 'അപകട റിപ്പോർട്ട് നൽകുക', ta: 'அபாய அறிக்கையை வழங்கவும்', hi: 'खतरा रिपोर्ट जारी करें' },
  report_description: { en: 'Report a lost net to warn other vessels and initiate retrieval.', ml: 'മറ്റ് കപ്പലുകൾക്ക് മുന്നറിയിപ്പ് നൽകാനും വീണ്ടെടുക്കൽ ആരംഭിക്കാനും നഷ്ടപ്പെട്ട വലയെക്കുറിച്ച് റിപ്പോർട്ട് ചെയ്യുക.', ta: 'மற்ற கப்பல்களை எச்சரிக்கவும் மீட்டெடுக்கவும் இழந்த வலையைப் புகாரளிக்கவும்.', hi: 'अन्य जहाजों को चेतावनी देने और पुनर्प्राप्ति शुरू करने के लिए खोए हुए जाल की रिपोर्ट करें।' },
  report_lost_net: { en: 'Report Lost Net', ml: 'നഷ്ടപ്പെട്ട വല റിപ്പോർട്ട് ചെയ്യുക', ta: 'இழந்த வலையைப் புகாரளிக்கவும்', hi: 'खोया हुआ जाल रिपोर्ट करें' },
  step_1_of_3: { en: 'STEP 1 OF 3', ml: 'ഘട്ടം 1 / 3', ta: 'படி 1 / 3', hi: 'चरण 1 / 3' },
  gill_net: { en: 'Gill Net', ml: 'ഗിൽ നെറ്റ്', ta: 'கில் நெட்', hi: 'गिल नेट' },
  trawl_net: { en: 'Trawl Net', ml: 'ട്രോൾ നെറ്റ്', ta: 'ட்ரால் நெட்', hi: 'ट्रॉल नेट' },
  drift_net: { en: 'Drift Net', ml: 'ഡ്രിഫ്റ്റ് നെറ്റ്', ta: 'டிரிஃப்ட் நெட்', hi: 'ड्रिफ्ट नेट' },
  other: { en: 'Other', ml: 'മറ്റുള്ളവ', ta: 'மற்றவை', hi: 'अन्य' },
  net_length: { en: 'NET LENGTH (METERS)', ml: 'വലയുടെ നീളം (മീറ്റർ)', ta: 'வலையின் நீளம் (மீட்டர்)', hi: 'जाल की लंबाई (मीटर)' },
  float_color: { en: 'FLOAT COLOR', ml: 'ഫ്ലോട്ട് നിറം', ta: 'மிதவை நிறம்', hi: 'फ्लोट रंग' },
  float_description: { en: 'FLOAT DESCRIPTION', ml: 'ഫ്ലോട്ട് വിവരണം', ta: 'மிதவை விளக்கம்', hi: 'फ्लोट विवरण' },
  next_step: { en: 'Next Step', ml: 'അടുത്ത ഘട്ടം', ta: 'அடுத்த படி', hi: 'अगला चरण' },
  back: { en: 'Back', ml: 'പുറകോട്ട്', ta: 'பின்னால்', hi: 'पीछे' },
  location_details: { en: 'Location Details', ml: 'ലൊക്കേഷൻ വിവരങ്ങൾ', ta: 'இருப்பிட விவரங்கள்', hi: 'स्थान विवरण' },
  additional_info: { en: 'Additional Info', ml: 'കൂടുതൽ വിവരങ്ങൾ', ta: 'கூடுதல் தகவல்', hi: 'अतिरिक्त जानकारी' },
  
  // GPS & Location
  acquiring_gps: { en: 'Acquiring Satellite Lock...', ml: 'സാറ്റലൈറ്റ് ലോക്ക് നേടുന്നു...', ta: 'செயற்கைக்கோள் பூட்டைப் பெறுகிறது...', hi: 'सैटेलाइट लॉक प्राप्त करना...' },
  gps_initialize: { en: 'Initialize GPS Lock', ml: 'ജിപിഎസ് ലോക്ക് ആരംഭിക്കുക', ta: 'ஜிபிஎஸ் பூட்டைத் தொடங்கவும்', hi: 'जीपीएस लॉक प्रारंभ करें' },
  latitude: { en: 'Latitude', ml: 'അക്ഷാംശം', ta: 'அட்சரேகை', hi: 'अक्षांश' },
  longitude: { en: 'Longitude', ml: 'രേഖാംശം', ta: 'தீர்க்கரேகை', hi: 'देशांतर' },
  sea_area_name: { en: 'Sea Area Name', ml: 'കടൽ പ്രദേശത്തിന്റെ പേര്', ta: 'கடல் பகுதியின் பெயர்', hi: 'समुद्र क्षेत्र का नाम' },
  simulation_mode: { en: 'Simulation Mode', ml: 'സിമുലേഷൻ മോഡ്', ta: 'சிமுலேஷன் பயன்முறை', hi: 'सिमुलेशन मोड' },

  // Step 3 & Completion
  estimated_depth: { en: 'Estimated Depth (Meters)', ml: 'കണക്കാക്കിയ ആഴം (മീറ്റർ)', ta: 'மதிப்பிடப்பட்ட ஆழம் (மீட்டர்)', hi: 'अनुमानित गहराई (मीटर)' },
  weather_condition: { en: 'Weather Condition', ml: 'കാലാവസ്ഥ', ta: 'வானிலை நிலை', hi: 'मौसम की स्थिति' },
  evidence_capture: { en: 'Evidence Capture', ml: 'തെളിവ് ശേഖരണം', ta: 'ஆதாரங்களைப் பிடித்தல்', hi: 'साक्ष्य कैप्चर' },
  no_evidence: { en: 'No evidence captured yet', ml: 'തെളിവുകളൊന്നും ലഭിച്ചിട്ടില്ല', ta: 'இதுவரை எந்த ஆதாரமும் கிடைக்கவில்லை', hi: 'अभी तक कोई साक्ष्य नहीं मिला है' },
  open_camera: { en: 'Open Camera', ml: 'ക്യാമറ തുറക്കുക', ta: 'கேமராவைத் திறக்கவும்', hi: 'कैमरा खोलें' },
  retake_photo: { en: 'Retake Photo', ml: 'വീണ്ടും ഫോട്ടോ എടുക്കുക', ta: 'மீண்டும் புகைப்படம் எடுக்கவும்', hi: 'फिर से फोटो लें' },
  notes_comments: { en: 'Notes / Comments', ml: 'കുറിപ്പുകൾ / അഭിപ്രായങ്ങൾ', ta: 'குறிப்புகள் / கருத்துகள்', hi: 'नोट्स / टिप्पणियाँ' },
  notes_placeholder: { en: 'Describe surroundings, drift direction, or any other details...', ml: 'ചുറ്റുപാടുകൾ, ഒഴുക്കിന്റെ ദിശ അല്ലെങ്കിൽ മറ്റ് വിശദാംശങ്ങൾ വിവരിക്കുക...', ta: 'சுற்றுப்புறங்கள், நகர்வு திசை அல்லது வேறு ஏதேனும் விவரங்களை விவரிக்கவும்...', hi: 'परिवेश, बहाव की दिशा या किसी अन्य विवरण का वर्णन करें...' },
  submit_hazard_report: { en: 'Submit Hazard Report', ml: 'അപകട റിപ്പോർട്ട് സമർപ്പിക്കുക', ta: 'அபாய அறிக்கையைச் சமர்ப்பிக்கவும்', hi: 'खतरा रिपोर्ट जमा करें' },
  transmitting: { en: 'Transmitting...', ml: 'അയക്കുന്നു...', ta: 'அனுப்புகிறது...', hi: 'भेजा जा रहा है...' },
  report_transmitted: { en: 'Report Transmitted', ml: 'റിപ്പോർട്ട് അയച്ചു', ta: 'அறிக்கை அனுப்பப்பட்டது', hi: 'रिपोर्ट भेजी गई' },
  hazard_id_generated: { en: 'Hazard ID generated. Nearby vessels have been notified.', ml: 'അപകട ഐഡി സൃഷ്ടിച്ചു. സമീപത്തുള്ള കപ്പലുകളെ അറിയിച്ചു.', ta: 'அபாய ஐடி உருவாக்கப்பட்டது. அருகிலுள்ள கப்பல்களுக்கு அறிவிக்கப்பட்டுள்ளது.', hi: 'खतरा आईडी उत्पन्न हुई। आस-पास के जहाजों को सूचित कर दिया गया है.' },
  return_dashboard: { en: 'Return to Command Center', ml: 'കമാൻഡ് സെന്ററിലേക്ക് മടങ്ങുക', ta: 'கட்டளை மையத்திற்குத் திரும்பு', hi: 'कमांड सेंटर पर लौटें' },
  
  // Retrievals Page
  retrieval_missions: { en: 'Retrieval Missions', ml: 'വീണ്ടെടുക്കൽ ദൗത്യങ്ങൾ', ta: 'மீட்பு பணிகள்', hi: 'पुनर्प्राप्ति मिशन' },
  manage_ghost_nets: { en: 'Manage and execute ghost net recovery operations.', ml: 'ഗോസ്റ്റ് നെറ്റ് വീണ്ടെടുക്കൽ പ്രവർത്തനങ്ങൾ നിയന്ത്രിക്കുകയും നടപ്പിലാക്കുകയും ചെയ്യുക.', ta: 'கோஸ்ட் நெட் மீட்பு நடவடிக்கைகளை நிர்வகிக்கவும் செயல்படுத்தவும்.', hi: 'घोस्ट नेट पुनर्प्राप्ति कार्यों का प्रबंधन और निष्पादन करें।' },
  open_missions: { en: 'Open Missions', ml: 'തുറന്ന ദൗത്യങ്ങൾ', ta: 'திறந்த பணிகள்', hi: 'खुले मिशन' },
  filter_all: { en: 'Filter: All', ml: 'ഫിൽട്ടർ: എല്ലാം', ta: 'வடிகட்டி: அனைத்தும்', hi: 'फ़िल्टर: सभी' },
  navigate_to_hazard: { en: 'Navigate to Hazard', ml: 'അപകട സ്ഥലത്തേക്ക് നാവിഗേറ്റ് ചെയ്യുക', ta: 'அபாயத்திற்கு செல்லவும்', hi: 'खतरे तक नेविगेट करें' },
  route: { en: 'Route', ml: 'റൂട്ട്', ta: 'பாதை', hi: 'मार्ग' },
  all_hazards_cleared: { en: 'All hazards cleared', ml: 'എല്ലാ അപകടങ്ങളും നീക്കം ചെയ്തു', ta: 'அனைத்து அபாயங்களும் நீக்கப்பட்டன', hi: 'सभी खतरों को साफ कर दिया गया है' },
  mission_brief: { en: 'Mission Brief', ml: 'ദൗത്യ വിവരം', ta: 'பணி சுருக்கம்', hi: 'मिशन ब्रीफ' },
  close: { en: 'Close', ml: 'അടയ്ക്കുക', ta: 'மூடு', hi: 'बंद करें' },
  radius: { en: 'Radius', ml: 'ആരം', ta: 'ஆரம்', hi: 'त्रिज्या' },
  reporter_information: { en: 'Reporter Information', ml: 'റിപ്പോർട്ടറുടെ വിവരങ്ങൾ', ta: 'புகாரளிப்பவர் தகவல்', hi: 'रिपोर्टर की जानकारी' },
  verified_guardian: { en: 'Verified Guardian', ml: 'പരിശോധിച്ചുറപ്പിച്ച ഗാർഡിയൻ', ta: 'சரிபார்க்கப்பட்ட பாதுகாவலர்', hi: 'सत्यापित अभिभावक' },
  mobile: { en: 'Mobile', ml: 'മൊബൈൽ', ta: 'கைபேசி', hi: 'मोबाइल' },
  govt_id: { en: 'Govt ID', ml: 'ഗവൺമെന്റ് ഐഡി', ta: 'அரசு ஐடி', hi: 'सरकारी आईडी' },
  reporter_data_unavailable: { en: 'Reporter data unavailable for this hazard.', ml: 'ഈ അപകടത്തിനായുള്ള റിപ്പോർട്ടറുടെ വിവരങ്ങൾ ലഭ്യമല്ല.', ta: 'இந்த அபாயத்திற்கான புகாரளிப்பவர் தரவு இல்லை.', hi: 'इस खतरे के लिए रिपोर्टर डेटा अनुपलब्ध है।' },
  navigation_brief: { en: 'Navigation Brief', ml: 'നാവിഗേഷൻ വിവരം', ta: 'வழிசெலுத்தல் சுருக்கம்', hi: 'नेविगेशन ब्रीफ' },
  distance_to_target: { en: 'Distance to Target', ml: 'ലക്ഷ്യസ്ഥാനത്തേക്കുള്ള ദൂരം', ta: 'இலக்கிற்கான தூரம்', hi: 'लक्ष्य की दूरी' },
  bearing: { en: 'Bearing', ml: 'ബിയറിംഗ്', ta: 'தாங்கி', hi: 'बेयरिंग' },
  open_external_maps: { en: 'Open in External Maps', ml: 'എക്സ്റ്റേണൽ മാപ്പിൽ തുറക്കുക', ta: 'வெளிப்புற வரைபடங்களில் திறக்கவும்', hi: 'बाहरी मानचित्रों में खोलें' },
  acquiring_intercept: { en: 'Acquiring Intercept Coordinates...', ml: 'ഇന്റർസെപ്റ്റ് കോർഡിനേറ്റുകൾ ശേഖരിക്കുന്നു...', ta: 'இடைமறிப்பு ஆயங்களைப் பெறுகிறது...', hi: 'इन्टरसेप्ट निर्देशांक प्राप्त करना...' },
  initialize_mission: { en: 'Initialize Mission', ml: 'ദൗത്യം ആരംഭിക്കുക', ta: 'பணியைத் தொடங்கவும்', hi: 'मिशन प्रारंभ करें' },
  sign_in_initialize: { en: 'Sign in to Initialize', ml: 'ആരംഭിക്കാൻ സൈൻ ഇൻ ചെയ്യുക', ta: 'தொடங்குவதற்கு உள்நுழையவும்', hi: 'प्रारंभ करने के लिए साइन इन करें' },
  retrieval_evidence: { en: 'Retrieval Evidence', ml: 'വീണ്ടെടുക്കൽ തെളിവ്', ta: 'மீட்பு ஆதாரம்', hi: 'पुनर्प्राप्ति साक्ष्य' },
  uploading: { en: 'Uploading...', ml: 'അപ്‌ലോഡ് ചെയ്യുന്നു...', ta: 'பதிவேற்றுகிறது...', hi: 'अपलोड हो रहा है...' },
  capture_proof: { en: 'Capture Proof of Retrieval', ml: 'വീണ്ടെടുക്കലിന്റെ തെളിവ് ശേഖരിക്കുക', ta: 'மீட்புக்கான ஆதாரத்தைப் பிடிக்கவும்', hi: 'पुनर्प्राप्ति का प्रमाण कैप्चर करें' },
  evidence_required: { en: 'Evidence Required', ml: 'തെളിവ് ആവശ്യമാണ്', ta: 'ஆதாரம் தேவை', hi: 'साक्ष्य आवश्यक' },
  too_far: { en: 'Too Far From Site', ml: 'ലക്ഷ്യസ്ഥാനത്ത് നിന്നും വളരെ ദൂരത്തിലാണ്', ta: 'தளத்திலிருந்து வெகு தொலைவில் உள்ளது', hi: 'साइट से बहुत दूर' },
  complete_retrieval: { en: 'Complete Retrieval', ml: 'വീണ്ടെടുക്കൽ പൂർത്തിയാക്കുക', ta: 'மீட்பு முடிக்கவும்', hi: 'पुनर्प्राप्ति पूर्ण करें' },
  authorization_required: { en: 'Authorization required for field ops', ml: 'ഫീൽഡ് ഓപ്പറേഷനുകൾക്ക് അനുമതി ആവശ്യമാണ്', ta: 'கள நடவடிக்கைகளுக்கு அங்கீகாரம் தேவை', hi: 'क्षेत्रीय कार्यों के लिए प्राधिकरण आवश्यक है' },
  select_mission_briefing: { en: 'Select a mission to view briefing and initiate recovery.', ml: 'ദൗത്യ വിവരങ്ങൾ കാണാനും വീണ്ടെടുക്കൽ ആരംഭിക്കാനും ഒരു ദൗത്യം തിരഞ്ഞെടുക്കുക.', ta: 'சுருக்கத்தைப் பார்க்கவும் மீட்டெடுப்பைத் தொடங்கவும் ஒரு பணியைத் தேர்ந்தெடுக்கவும்.', hi: 'ब्रीफिंग देखने और पुनर्प्राप्ति शुरू करने के लिए एक मिशन चुनें।' },
  
  spatial_integrity: { en: 'Spatial Integrity', ml: 'സ്ഥലകാല സമഗ്രത', ta: 'இடஞ்சார்ந்த ஒருமைப்பாடு', hi: 'स्थानिक अखंडता' },
  spatial_integrity_msg: { en: 'Reporting from land is restricted in production.', ml: 'കരയിൽ നിന്നുള്ള റിപ്പോർട്ടിംഗ് നിരോധിച്ചിരിക്കുന്നു.', ta: 'நிலத்திலிருந்து புகாரளிப்பது தடைசெய்யப்பட்டுள்ளது.', hi: 'भूमि से रिपोर्टिंग प्रतिबंधित है।' },
  refresh_location: { en: 'Refresh Location', ml: 'ലൊക്കേഷൻ പുതുക്കുക', ta: 'இருப்பிடத்தைப் புதுப்பிக்கவும்', hi: 'स्थान ताज़ा करें' },
  eg_bay_of_bengal: { en: 'e.g. Bay of Bengal - Sector 4', ml: 'ഉദാഹരണത്തിന്: ബംഗാൾ ഉൾക്കടൽ - സെക്ടർ 4', ta: 'எ.கா. வங்காள விரிகுடா - பிரிவு 4', hi: 'जैसे: बंगाल की खाड़ी - सेक्टर 4' },
  calm: { en: 'Calm', ml: 'ശാന്തം', ta: 'அமைதி', hi: 'शांत' },
  rough: { en: 'Rough', ml: 'പ്രക്ഷുബ്ധം', ta: 'கடுமையான', hi: 'ऊबड़-खाबड़' },
  stormy: { en: 'Stormy', ml: 'കൊടുങ്കാറ്റുള്ള', ta: 'புயல்', hi: 'तूफानी' },
  clear: { en: 'Clear', ml: 'തെളിഞ്ഞ', ta: 'தெளிவான', hi: 'साफ़' },
  image_verified: { en: 'Image Verified', ml: 'ചിത്രം പരിശോധിച്ചു', ta: 'படம் சரிபார்க்கப்பட்டது', hi: 'छवि सत्यापित' },
  metadata_attached: { en: 'Metadata attached for validation', ml: 'പരിശോധനയ്ക്കായി മെറ്റാഡാറ്റ ചേർത്തിട്ടുണ്ട്', ta: 'சரிபார்ப்பிற்காக மெட்டாடேட்டா இணைக்கப்பட்டுள்ளது', hi: 'सत्यापन के लिए मेटाडेटा संलग्न' },
  
  // Profile / Settings
  edit_profile: { en: 'Edit Profile', ml: 'പ്രൊഫൈൽ തിരുത്തുക', ta: 'சுயவிவரத்தைத் திருத்து', hi: 'प्रोफ़ाइल संपादित करें' },
  full_name: { en: 'Full Name', ml: 'പൂർണ്ണനാമം', ta: 'முழு பெயர்', hi: 'पूरा नाम' },
  mobile_number: { en: 'Mobile Number', ml: 'മൊബൈൽ നമ്പർ', ta: 'கைபேസി எண்', hi: 'मोबाइल नंबर' },
  language_preference: { en: 'Language Preference', ml: 'ഭാഷാ മുൻഗണന', ta: 'மொழி விருப்பம்', hi: 'भाषा प्राथमिकता' },
  save_changes: { en: 'Save Changes', ml: 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക', ta: 'மாற்றங்களைச் சேமிக்கவும்', hi: 'परिवर्तन सहेजें' },
  manage_account_prefs: { en: 'Manage your account preferences and personal information.', ml: 'നിങ്ങളുടെ അക്കൗണ്ട് മുൻഗണനകളും വ്യക്തിഗത വിവരങ്ങളും നിയന്ത്രിക്കുക.', ta: 'உங்கள் கணக்கு விருப்பங்களையும் தனிப்பட்ட தகவலையும் நிர்வகிக்கவும்.', hi: 'अपनी खाता प्राथमिकताएं और व्यक्तिगत जानकारी प्रबंधित करें।' },
  security_note: { en: 'Security Note', ml: 'സുരക്ഷാ കുറിപ്പ്', ta: 'பாதுகாப்பு குறிப்பு', hi: 'सुरक्षा नोट' },
  security_msg: { en: 'Your biometric and identity credentials are cryptographically locked. Profile updates are verified against the central maritime registry.', ml: 'നിങ്ങളുടെ ബയോമെട്രിക് വിവരങ്ങളും ഐഡന്റിറ്റി ക്രെഡൻഷ്യലുകളും സുരക്ഷിതമായി പൂട്ടിയിരിക്കുകയാണ്.', ta: 'உங்கள் பயோமெட்ரிக் மற்றும் அடையாள சான்றுகள் குறியாக்கவியல் ரீதியாக பூட்டப்பட்டுள்ளன.', hi: 'आपके बायोमेट्रिक और पहचान क्रेडेंशियल क्रिप्टोग्राफ़िक रूप से लॉक हैं।' },
  localized_access: { en: 'Localized Access', ml: 'പ്രാദേശിക ആക്സസ്', ta: 'உள்ளூர் அணுகல்', hi: 'स्थानीयकृत पहुंच' },
  localized_access_msg: { en: 'Language preferences are now managed globally via the Top Bar for instant access across all missions.', ml: 'എല്ലാ ദൗത്യങ്ങളിലും തൽക്ഷണ ആക്സസിനായി ഭാഷാ മുൻഗണനകൾ ഇപ്പോൾ ടോപ്പ് ബാർ വഴി ആഗോളതലത്തിൽ നിയന്ത്രിക്കുന്നു.', ta: 'அனைத்து பணிகளிலும் உடனடி அணுகலுக்காக மொழி விருப்பத்தேர்வுகள் இப்போது மேல் பட்டி வழியாக உலகளவில் நிர்வகிக்கப்படுகின்றன.', hi: 'सभी मिशनों में त्वरित पहुंच के लिए भाषा प्राथमिकताएं अब टॉप बार के माध्यम से विश्व स्तर पर प्रबंधित की जाती हैं।' },
  email_address: { en: 'Email Address', ml: 'ഇമെയിൽ വിലാസം', ta: 'மின்னஞ்சல் முகவரி', hi: 'ईमेल पता' },
  email_change_note: { en: 'Email changes require secondary verification and are currently managed via the portal admin.', ml: 'ഇമെയിൽ മാറ്റങ്ങൾക്ക് സെക്കൻഡറി വെരിഫിക്കേഷൻ ആവശ്യമാണ്.', ta: 'மின்னஞ்சல் மாற்றங்களுக்கு இரண்டாம் நிலை சரிபார்ப்பு தேவை.', hi: 'ईमेल परिवर्तनों के लिए द्वितीयक सत्यापन की आवश्यकता होती है।' },
  active: { en: 'Active', ml: 'സജീവം', ta: 'செயலில்', hi: 'सक्रिय' },
  auth_id: { en: 'Auth ID', ml: 'അംഗീകാര ഐഡി', ta: 'அங்கீகார ஐடி', hi: 'प्रमाणीकरण आईडी' },
  detecting_location: { en: 'Detecting Location...', ml: 'ലൊക്കേഷൻ കണ്ടെത്തുന്നു...', ta: 'இருப்பிடத்தைக் கண்டறிகிறது...', hi: 'स्थान का पता लगाया जा रहा है...' },
  search_placeholder: { en: 'Search coordinates, vessels, or IDs...', ml: 'കോർഡിനേറ്റുകൾ, കപ്പലുകൾ അല്ലെങ്കിൽ ഐഡികൾ തിരയുക...', ta: 'ஆயங்கள், கப்பல்கள் அல்லது ஐடிகளைத் தேடுங்கள்...', hi: 'निर्देशांक, जहाज या आईडी खोजें...' },
  maritime_zone_unknown: { en: 'Maritime Zone Unknown', ml: 'മാരിടൈം സോൺ അറിയില്ല', ta: 'கடல் மண்டலம் தெரியவில்லை', hi: 'समुद्री क्षेत्र अज्ञात' },
  registered_user: { en: 'Registered User', ml: 'രജിസ്റ്റർ ചെയ്ത ഉപയോക്താവ്', ta: 'பதிவுசெய்யப்பட்ட பயனர்', hi: 'पंजीकृत उपयोगकर्ता' },
  guest_guardian: { en: 'Guest Guardian', ml: 'ഗസ്റ്റ് ഗാർഡിയൻ', ta: 'விருந்தினர் பாதுகாவலர்', hi: 'अतिथि संरक्षक' },
  view_only_access: { en: 'View-Only Access', ml: 'കാണാൻ മാത്രമുള്ള അനുമതി', ta: 'பார்க்க மட்டும் அனுமதி', hi: 'केवल देखने के लिए पहुंच' },
  confirm_disconnect: { en: 'Confirm Disconnect', ml: 'പുറത്തുകടക്കുന്നത് സ്ഥിരീകരിക്കുക', ta: 'துண்டிப்பை உறுதிப்படுத்தவும்', hi: 'डिस्कनेक्ट की पुष्टि करें' },
  logout_warning: { en: 'Are you sure you want to terminate your current session? You will need to re-authenticate for field operations.', ml: 'നിങ്ങളുടെ നിലവിലെ സെഷൻ അവസാനിപ്പിക്കാൻ നിങ്ങൾക്ക് ഉറപ്പാണോ?', ta: 'உங்கள் தற்போதைய அமர்வை முடிக்க விரும்புகிறீர்களா?', hi: 'क्या आप वाकई अपना वर्तमान सत्र समाप्त करना चाहते हैं?' },
  cancel: { en: 'Cancel', ml: 'റദ്ദാക്കുക', ta: 'ரத்துசெய்', hi: 'रद्द करें' },
  disconnect: { en: 'Disconnect', ml: 'പുറത്തുകടക്കുക', ta: 'துண்டிக்கவும்', hi: 'डिस्कनेक्ट' },
  
  // Messages
  profile_updated: { en: 'Profile updated successfully!', ml: 'പ്രൊഫൈൽ വിജയകരമായി പുതുക്കി!', ta: 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!', hi: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!' },
  verify_otp: { en: 'Verify OTP', ml: 'OTP പരിശോധിക്കുക', ta: 'OTP ஐ சரிபார்க்கவும்', hi: 'ओटीपी सत्यापित करें' },
  enter_otp: { en: 'Enter the 6-digit code sent to your mobile', ml: 'നിങ്ങളുടെ മൊബൈലിലേക്ക് അയച്ച 6 അക്ക കോഡ് നൽകുക', ta: 'உங்கள் கைபேசிக்கு அனுப்பப்பட்ட 6 இலக்கக் குறியீட்டை உள்ளிடவும்', hi: 'अपने मोबाइल पर भेजा गया 6-अंकीय कोड दर्ज करें' },
  otp_sent: { en: 'Verification code sent!', ml: 'പരിശോധനാ കോഡ് അയച്ചു!', ta: 'சரிபார்ப்புக் குறியீடு அனுப்பப்பட்டது!', hi: 'सत्यापन कोड भेजा गया!' },
  resend_otp: { en: 'Resend OTP', ml: 'വീണ്ടും അയക്കുക', ta: 'OTP ஐ மீண்டும் அனுப்பவும்', hi: 'ओटीपी पुनः भेजें' },
  invalid_otp: { en: 'Invalid verification code', ml: 'അസാധുവായ കോഡ്', ta: 'தவறான சரிபார்ப்புக் குறியீடு', hi: 'अमान्य सत्यापन कोड' },
  email_verification_sent: { en: 'Verification email sent to your new address.', ml: 'പുതിയ വിലാസത്തിലേക്ക് ഇമെയിൽ അയച്ചു.', ta: 'உங்கள் புதிய முகவரிக்கு சரிபார்ப்பு மின்னஞ்சல் அனுப்பப்பட்டது.', hi: 'आपके नए पते पर सत्यापन ईमेल भेजा गया।' },
  welcome_back: { en: 'Welcome back', ml: 'വീണ്ടും സ്വാഗതം', ta: 'மீண்டும் வருக', hi: 'वापसी पर स्वागत है' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('ghostnet_lang') as Language;
    if (saved && ['en', 'ml', 'ta', 'hi'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ghostnet_lang', lang);
  };

  const t = (key: string) => {
    return dictionary[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
