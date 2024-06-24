import logoCayad from '../../../public/img/logo-cayad.webp'
import AuthorizeNetSeal from '../../components/buttons/AuthorizeNetSeal'
const FormQuote = () => {
    return (
        <div className="h-max w-[60%] bg-white">
            <div className="flex justify-around">
                <div className='max-h-[50px] max-w-[200px]'>
                    <img src={logoCayad.src} />
                </div>
                <p className=' font-bold text-[180x]'>Get Free Quote Request</p>
                <AuthorizeNetSeal />
            </div>
        </div>
    )
};

export default FormQuote;
