/**
 * Vanilla Alert Library
 * 
 * @version   1.3
 * @author    Gonzalo R. Meneses A. <github.com/alakentu>
 * @license   MIT
 * 
 * Methods: jAlert, jConfirm, jPrompt
 * 
 * Usage:
 * 	jAlert( message, [title, callback] )
 * 	jConfirm( message, [title, callback] )
 * 	jPrompt( message, [value, title, callback] )
 * 
 * // Basic alert
 * jAlert('Sample message', 'Title', function() {
 *     console.log('Alerta cerrada');
 * });
 * 
 * // Confirmation
 * jConfirm('Are you sure you want to delete this item?', 'Confirm', function() {
 *     console.log('User confirmed');
 * });
 * 
 * // Prompt
 * jPrompt('Enter your name:', 'Registration', function(name) {
 *     if (name) console.log('Name:', name);
 * });
 * 
 *  
 * Enjoy!
 */
class VanillaAlert {
  constructor() {
    this.defaults = {
      title: 'Alert',
      content: '',
      buttons: {},
      theme: 'primary',
      closeOnClick: true,
      closeOnEsc: true,
      autoClose: false,
      timeout: 3000,
      verticalOffset: -75,		// vertical offset of the dialog from center screen, in pixels
      horizontalOffset: 0,		// horizontal offset of the dialog from center screen, in pixels/
      repositionOnResize: true,	// re-centers the dialog on window resize
      overlayOpacity: 0.6,		// transparency level of overlay
      overlayColor: '#000',		// base color of overlay
      draggable: true,			// make the dialogs draggable
      okButton: 'OK',			// text for the OK button
      cancelButton: 'Cancel',	// text for the Cancel button
      dialogClass: '',			// if specified, this class will be applied to all dialogs
      dialogWidth: '400px',
      dialogMaxHeight: '80vh',
      onOpen: null,
      onClose: null,
      okButtonId: 'popup_ok',
      cancelButtonId: 'popup_cancel'
    };

    this.setupGlobalMethods();
  }

  setupGlobalMethods() {
    window.jAlert = this.alert.bind(this);
    window.jConfirm = this.confirm.bind(this);
    window.jPrompt = this.prompt.bind(this);
  }

  show(options) {
    const config = {...this.defaults, ...options};
    const alertId = 'va-' + Date.now();
    
    // Crear elemento principal
    const alertEl = document.createElement('div');
    alertEl.className = 'vanilla-alert';
    alertEl.id = alertId;
    
    // Plantilla del alert
    alertEl.innerHTML = `
      <div class="vanilla-alert-overlay"></div>
      <div class="vanilla-alert-dialog vanilla-alert-theme-${config.theme} ${config.dialogClass}">
        <div class="vanilla-alert-title">${config.title}</div>
        <div class="vanilla-alert-content">${config.content}</div>
        <div class="vanilla-alert-buttons"></div>
        <button class="vanilla-alert-close" aria-label="Close">&times;</button>
      </div>
    `;
    
    document.body.appendChild(alertEl);
    
    // Referencias a elementos
    const dialogEl = alertEl.querySelector('.vanilla-alert-dialog');
    const overlayEl = alertEl.querySelector('.vanilla-alert-overlay');
    const buttonsContainer = alertEl.querySelector('.vanilla-alert-buttons');
    const closeBtn = alertEl.querySelector('.vanilla-alert-close');
    
    // Aplicar estilos dinámicos
    overlayEl.style.backgroundColor = config.overlayColor;
    overlayEl.style.opacity = config.overlayOpacity;
    dialogEl.style.marginTop = `${config.verticalOffset}px`;
    dialogEl.style.marginLeft = `${config.horizontalOffset}px`;
    dialogEl.style.width = config.dialogWidth;
    dialogEl.style.maxHeight = config.dialogMaxHeight;
    
    // Crear botones como inputs
    Object.entries(config.buttons).forEach(([text, callback]) => {
      const btnText = text === 'OK' ? config.okButton : 
                     (text === 'Cancel' ? config.cancelButton : text);
      
      const buttonId = text === 'OK' ? config.okButtonId : 
                      (text === 'Cancel' ? config.cancelButtonId : '');
      
      const button = document.createElement('input');
      button.type = 'button';
      button.value = btnText;
      button.className = `vanilla-alert-button ${
        text === 'OK' ? 'vanilla-alert-button-primary' : 'vanilla-alert-button-secondary'
      }`;
      
      if (buttonId) {
        button.id = buttonId;
      }
      
      button.addEventListener('click', () => {
        if (typeof callback === 'function') callback();
        this.closeAlert(alertEl, config);
      });
      
      buttonsContainer.appendChild(button);
    });
    
    // Eventos
    if (config.closeOnClick) {
      overlayEl.addEventListener('click', () => this.closeAlert(alertEl, config));
    }
    
    const handleKeydown = (e) => {
      if (e.key === 'Escape' && config.closeOnEsc) {
        this.closeAlert(alertEl, config);
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
    
    closeBtn.addEventListener('click', () => this.closeAlert(alertEl, config));
    
    // Auto cierre
    if (config.autoClose) {
      setTimeout(() => this.closeAlert(alertEl, config), config.timeout);
    }
    
    // Redimensionamiento
    const handleResize = () => {
      dialogEl.style.marginTop = `${config.verticalOffset}px`;
      dialogEl.style.marginLeft = `${config.horizontalOffset}px`;
    };
    
    if (config.repositionOnResize) {
      window.addEventListener('resize', handleResize);
    }
    
    // Hacer arrastrable
    if (config.draggable) {
      this.makeDraggable(dialogEl);
    }
    
    // Mostrar alerta
    setTimeout(() => {
      alertEl.style.display = 'block';
      if (typeof config.onOpen === 'function') config.onOpen();
    }, 10);
    
    // Retornar API pública
    return {
      close: () => this.closeAlert(alertEl, config),
      element: alertEl
    };
  }

  makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;

    const dragMouseDown = (e) => {
      if (e.button !== 0) return;
      
      e.preventDefault();
      isDragging = true;
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      element.classList.add('dragging');
      element.style.cursor = 'grabbing';
      element.style.userSelect = 'none';
      
      document.addEventListener('mouseup', closeDragElement);
      document.addEventListener('mousemove', elementDrag);
    };

    const elementDrag = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      element.style.top = `${element.offsetTop - pos2}px`;
      element.style.left = `${element.offsetLeft - pos1}px`;
      element.style.transform = 'none';
      element.style.margin = '0';
      element.style.position = 'fixed';
    };

    const closeDragElement = () => {
      isDragging = false;
      element.classList.remove('dragging');
      element.style.cursor = 'grab';
      element.style.userSelect = '';
      
      document.removeEventListener('mouseup', closeDragElement);
      document.removeEventListener('mousemove', elementDrag);
    };

    element.style.cursor = 'grab';
    element.addEventListener('mousedown', dragMouseDown);
  }

  closeAlert(alertEl, config) {
    alertEl.style.opacity = '0';
    setTimeout(() => {
      alertEl.remove();
      if (typeof config.onClose === 'function') config.onClose();
      window.removeEventListener('resize', this.handleResize);
    }, 200);
  }

  alert(content, title, callback, options) {
    return this.show({
      title: title || 'Alert',
      content: content,
      buttons: { [this.defaults.okButton]: callback || (() => {}) },
      ...options
    });
  }

  confirm(content, title, callback, options) {
    return this.show({
      title: title || 'Confirm',
      content: content,
      buttons: {
        [this.defaults.cancelButton]: () => {},
        [this.defaults.okButton]: callback
      },
      theme: 'warning',
      ...options
    });
  }

  prompt(content, title, callback, defaultValue = '', options) {
    const promptId = 'va-prompt-' + Date.now();
    return this.show({
      title: title || 'Prompt',
      content: `
        <div style="margin-bottom: 15px;">${content}</div>
        <input type="text" id="${promptId}" class="va-prompt-input" value="${defaultValue}">
      `,
      buttons: {
        [this.defaults.cancelButton]: () => {},
        [this.defaults.okButton]: () => {
          const value = document.getElementById(promptId).value;
          if (callback) callback(value);
        }
      },
      theme: 'info',
      onOpen: () => {
        const input = document.getElementById(promptId);
        input.focus();
        input.select();
      },
      ...options
    });
  }
}

// Inicialización automática
if (typeof window !== 'undefined') {
  new VanillaAlert();
}
