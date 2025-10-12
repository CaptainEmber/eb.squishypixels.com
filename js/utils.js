// utils.js
window.ntExample = {
  randomColor: () => {
    return (
      "#" +
      new THREE.Color(
        Math.random(),
        Math.random(),
        Math.random()
      ).getHexString()
    );
  },
};