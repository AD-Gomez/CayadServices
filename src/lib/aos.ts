import AOS from "aos";

export function aosInit () {
  AOS.init({ duration: 1000, once: true });
}
document.addEventListener('DOMContentLoaded', () => {
  aosInit();
});