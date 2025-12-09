import '../styles/marquee.css'; // Asegúrate de tener el archivo CSS configurado correctamente

const MarqueeText = () => {
  return (
    <div className="overflow-hidden w-full max-h-[40px] py-[1px] whitespace-nowrap text-gray-800 bg-white relative z-50">
      <div className="inline-block w-full   marquee">
        <span className="text-[#006b34] font-bold">Cayad Auto Transport</span> - is the most cost effective
        <span className="text-[#00a1e1] mx-2 font-bold">5 stars </span>auto transport company.
      </div>
    </div>
  );
};

export default MarqueeText;
