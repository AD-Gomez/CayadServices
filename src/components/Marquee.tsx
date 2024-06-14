import '../styles/marquee.css'; // Asegúrate de tener el archivo CSS configurado correctamente

const MarqueeText = () => {
    return (
        <div className="overflow-hidden w-full   whitespace-nowrap bg-white py-2">
            <div className="inline-block w-full marquee">
                <span className="text-[#029046] font-bold">Cayad Auto Transport</span> - assists with all your auto
                <span className="text-[#00a1ef] mx-2 font-bold">shipping</span> needs in all the United States.
            </div>
        </div>
    );
};

export default MarqueeText;
