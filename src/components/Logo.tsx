const Logo = ({ size = 50 }: { size?: number }) => {
  return (
    <svg
      width="150"
      height="150"
      viewBox="0 0 150 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="fill-foreground"
      style={{ width: size, height: size }}
    >
      <path d="M124.38 110.628H124.349C121.627 110.51 118.591 111.948 116.098 110.728C114.122 109.71 112.928 108.239 111.162 106.525C109.409 104.691 107.39 102.968 105.985 100.956C104.723 99.1702 104.908 97.4062 105.35 95.1798C105.617 93.7259 105.82 92.2289 105.73 90.7404C105.507 85.6211 102.219 80.8402 97.4844 78.8856C93.7943 77.2771 90.482 77.7831 86.8142 78.4616C84.4801 78.8808 82.6943 77.8188 81.056 76.2473C79.2445 74.5274 77.3535 72.5571 75.573 70.7873C74.3478 69.5201 73.0364 68.2326 72.4087 66.5836C71.5344 64.1072 72.6323 61.2652 72.3606 58.6205C72.086 53.4144 68.6541 48.6224 63.8064 46.7631C61.5519 45.8449 59.0078 45.6439 56.6167 45.9086C53.3238 46.308 51.5481 46.3604 48.9755 43.9972C47.0379 42.2197 45.0621 40.124 43.1888 38.2661C42.088 37.1265 40.9166 35.9078 40.3186 34.4702C39.5891 32.707 40.015 30.941 40.1893 29.0536C40.2923 28.036 40.3459 26.9291 40.2517 25.8428C39.7929 18.7995 33.4831 13.0764 26.4367 13.3159C17.3626 13.3693 10.9133 22.4232 13.6251 31.0664C15.265 36.7359 20.8636 40.8041 26.7659 40.679C28.8268 40.7129 30.9232 40.0541 32.9397 40.2132C35.0078 40.4625 36.2875 41.6608 37.9592 43.2482C39.3575 44.632 41.0162 46.3065 42.4201 47.7221C45.3705 50.7224 46.2001 52.1363 45.3696 56.4281C44.4399 61.2283 45.9301 66.5006 49.6468 69.7199C53.0011 72.8001 57.7697 73.7336 62.1818 72.8483C66.3483 71.9987 67.8322 73.2557 70.6403 76.0553C72.0604 77.4788 73.7113 79.1359 75.1162 80.55C77.1043 82.5746 78.7422 84.3042 78.6731 87.0778C78.6334 89.1173 78.2791 91.2607 78.5892 93.32C79.3226 99.4144 84.3847 104.413 90.46 105.067C91.8076 105.235 93.1726 105.171 94.5151 105.066C96.5081 104.9 98.0821 104.816 99.6954 105.776C101.111 106.613 102.206 107.769 103.429 108.977C104.864 110.423 106.548 112.096 107.94 113.516C109.54 115.207 110.732 116.506 110.98 118.603C111.15 120.798 110.516 123.127 110.746 125.374C111.059 129.986 113.854 134.296 117.911 136.406C124.864 140.148 133.93 137.051 136.927 129.651C140.683 120.653 134.124 110.603 124.38 110.628Z" />
      <path d="M27.8634 45.4028C21.4671 44.9674 15.3054 49.2038 13.603 55.4395C12.0019 60.8583 14.1125 67.1015 18.6909 70.3797C20.6143 71.7203 22.9503 73.2617 23.0288 75.8028C23.081 77.1709 22.2336 78.585 21.1499 79.5609C20.3607 80.2779 19.44 80.8305 18.5916 81.4794C17.1188 82.5884 15.8698 83.9853 14.9409 85.5859C13.2286 88.488 12.6557 92.1795 13.3944 95.5086C15.5012 105.47 27.6239 109.679 35.6021 103.537C42.8382 98.0832 42.8072 86.9168 35.5363 81.4983C34.2702 80.5393 33.0258 79.8512 32.1397 78.6827C30.211 76.2844 31.1056 73.6453 33.385 71.8552C33.9847 71.3736 34.6567 70.9386 35.2883 70.4721C38.8176 67.9647 41.0574 63.6673 41.0274 59.2635V59.2313C41.1415 51.9932 35.0857 45.6841 27.8634 45.4028Z" />
      <path d="M92.2191 109.96H92.1869C87.8075 109.93 83.5346 112.165 81.0333 115.691C80.5613 116.331 80.123 117.013 79.6381 117.622C77.6524 120.167 74.7414 120.853 72.2505 118.604C71.206 117.697 70.4552 116.306 69.5017 115.123C68.7794 114.22 67.945 113.409 67.0221 112.714C66.1364 112.047 65.1746 111.49 64.1517 111.055C53.2192 106.548 42.3496 116.552 45.4816 127.887C47.811 136.573 58.1324 140.711 65.7768 136.08C68.0023 134.818 69.6356 132.822 71.0349 130.724C72.0615 129.251 73.7786 127.918 75.576 127.981C77.8579 128.018 79.5543 130.02 80.7278 131.843C85.0016 138.376 94.2624 140.002 100.465 135.249C110.994 127.131 105.633 110.096 92.2191 109.96Z" />
      <path d="M55.5881 40.7779C60.6768 42.0228 66.3119 40.0808 69.5227 35.9609C70.2234 35.1007 70.8314 34.1642 71.622 33.3881C72.6769 32.3488 74.1543 31.5921 75.6002 31.6546C78.3225 31.7941 79.7955 33.9162 81.2676 35.936C83.518 38.8864 86.9054 40.8451 90.6272 41.2592C98.1939 42.1944 105.154 36.539 105.934 28.9591C106.947 20.7628 100.477 13.2405 92.2186 13.3155H92.1865C87.698 13.2847 83.3304 15.6328 80.8501 19.3084C80.3981 19.9519 79.979 20.6389 79.5144 21.253C77.7866 23.5929 75.1376 24.5582 72.7707 22.5534C71.6269 21.634 70.9885 20.3525 70.0712 19.0356C66.0057 13.0422 57.6031 11.3163 51.5062 15.1721C41.1 21.7256 43.5727 37.8852 55.5881 40.7779Z" />
      <path d="M126.567 45.9678C118.852 44.4659 111.044 49.9771 110.155 57.8405C109.783 60.6917 110.347 63.727 111.707 66.206C112.697 68.0394 114.106 69.6215 115.781 70.8363C117.617 72.1124 120.203 73.9016 119.789 76.3203C119.471 78.3003 117.205 79.7796 115.582 80.9389C109.597 85.2879 108.245 94.1813 112.654 100.132C115.958 104.807 122.205 106.926 127.698 105.407C138.726 102.505 141.645 88.0872 132.676 81.1098C131.312 80.0575 129.673 79.1441 128.769 77.6527L128.755 77.6304C127.645 75.9403 128.345 74.1521 129.677 72.8541C130.836 71.6726 132.582 70.7849 133.829 69.5107C136.95 66.5127 138.473 62.0071 137.865 57.7127C137.133 51.8315 132.368 46.9467 126.567 45.9678Z" />
      <path d="M39.961 129.339C42.9144 122.187 39.5285 113.987 32.3982 111.024C25.2679 108.061 17.0934 111.458 14.1399 118.61C11.1865 125.763 14.5725 133.963 21.7028 136.925C28.833 139.888 37.0075 136.492 39.961 129.339Z" />
      <path d="M123.706 41.0357C131.424 41.0357 137.68 34.7597 137.68 27.0178C137.68 19.276 131.424 13 123.706 13C115.988 13 109.732 19.276 109.732 27.0178C109.732 34.7597 115.988 41.0357 123.706 41.0357Z" />
    </svg>
  );
};

export default Logo;
