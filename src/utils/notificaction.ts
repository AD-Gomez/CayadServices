import Swal from 'sweetalert2';
import type { SweetAlertPosition, SweetAlertIcon } from 'sweetalert2';

// ASSETS
import successIcon from '../../public/img/icon/successIcon.svg';
import warningIcon from '../../public/img/icon/warningIcon.svg';
import errorIcon from '../../public/img/icon/errorIcon.svg';
import infoIcon from '../../public/img/icon/infoIcon.svg';

interface NotificationOptions {
    title?: string;
    text?: string;
    icon?: SweetAlertIcon;
    position?: SweetAlertPosition;
    timer?: number;
}

const showNotification = ({ title, text, icon, position = 'bottom-end', timer }: NotificationOptions): void => {
    let backgroundToast = '';
    let colorTitle = '';
    let typeIcon = {
        src: ''
    };

    if (icon === 'success') {
        backgroundToast = '#D3EBD3';
        typeIcon = successIcon;
        colorTitle = '#357A38';
    } else if (icon === 'error') {
        typeIcon = errorIcon;
        colorTitle = '#A13311';
        backgroundToast = '#FFB199';
    } else if (icon === 'warning') {
        backgroundToast = '#FFDA99';
        typeIcon = warningIcon;
        colorTitle = '#B26A00';
    } else if (icon === 'info') {
        backgroundToast = '#F5F5F5';
        typeIcon = infoIcon;
        colorTitle = '#767676';
    }

    void Swal.fire({
        toast: true,
        position,
        showConfirmButton: false,
        timer: timer ?? 2000,
        title,
        text,
        iconHtml: `<img src="${typeIcon.src}" alt="Custom Icon" width="30">`,
        iconColor: 'transparent',
        timerProgressBar: true,
        background: backgroundToast,
        color: colorTitle,
        customClass: {
            container: 'z-index: 9999999; border: 0;',
            htmlContainer: 'z-index: 9999999; border: 0;',
            icon: 'border-color: transparent;'
        },
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
};

export { showNotification };
