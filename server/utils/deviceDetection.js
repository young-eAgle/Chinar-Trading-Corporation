export const getClientInfo = (req) => {
    const userAgent = req.headers['user-agent'];
    
    return {
        deviceType: getDeviceType(userAgent),
        browser: getBrowser(userAgent),
        platform: getPlatform(userAgent)
    };
};

const getDeviceType = (userAgent) => {
    if (/mobile/i.test(userAgent)) {
        return 'mobile';
    }
    if (/tablet/i.test(userAgent)) {
        return 'tablet';
    }
    return 'desktop';
};

const getBrowser = (userAgent) => {
    if (/chrome/i.test(userAgent)) {
        return 'Chrome';
    }
    if (/firefox/i.test(userAgent)) {
        return 'Firefox';
    }
    if (/safari/i.test(userAgent)) {
        return 'Safari';
    }
    if (/edge/i.test(userAgent)) {
        return 'Edge';
    }
    if (/opera/i.test(userAgent)) {
        return 'Opera';
    }
    return 'Unknown';
};

const getPlatform = (userAgent) => {
    if (/windows/i.test(userAgent)) {
        return 'Windows';
    }
    if (/macintosh|mac os x/i.test(userAgent)) {
        return 'MacOS';
    }
    if (/linux/i.test(userAgent)) {
        return 'Linux';
    }
    if (/android/i.test(userAgent)) {
        return 'Android';
    }
    if (/iphone|ipad|ipod/i.test(userAgent)) {
        return 'iOS';
    }
    return 'Unknown';
}; 