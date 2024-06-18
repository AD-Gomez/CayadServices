import '../styles/marquee.css'; // Asegúrate de tener el archivo CSS configurado correctamente

const MarqueeText = () => {
    return (
        <div className="overflow-hidden w-full max-h-[40px] py-[1px] whitespace-nowrap bg-white ">
            <div className="inline-block w-full  marquee">
                <span className="text-[#029046] font-bold">Cayad Auto Transport</span> - is the most cost effective
                <span className="text-[#00a1ef] mx-2 font-bold">5 stars auto</span> transport company.
            </div>
        </div>
    );
};

export default MarqueeText;
