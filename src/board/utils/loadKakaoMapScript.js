let kakaoMapScriptPromise = null;

export const loadKakaoMapScript = () => {
  if (window.kakao?.maps?.services) {
    return Promise.resolve(window.kakao);
  }

  if (kakaoMapScriptPromise) {
    return kakaoMapScriptPromise;
  }

  const kakaoJavaScriptKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

  if (!kakaoJavaScriptKey) {
    return Promise.reject(
      new Error("VITE_KAKAO_JAVASCRIPT_KEY가 설정되어 있지 않습니다.")
    );
  }

  kakaoMapScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoJavaScriptKey}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        resolve(window.kakao);
      });
    };

    script.onerror = () => {
      reject(new Error("Kakao Maps JavaScript SDK 로드에 실패했습니다."));
    };

    document.head.appendChild(script);
  });

  return kakaoMapScriptPromise;
};