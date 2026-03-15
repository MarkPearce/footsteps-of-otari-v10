/**
 * Define your class that extends ApplicationV2
 */
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class GhostApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(options = {}) {
    super(options);
    this.totalProgress = 0;
    this.playbackSpeed = 1;
    this.mapVersion = 'remaster';
    this.mapLevel = 'two';
  }

  static DEFAULT_OPTIONS = {
    id: 'footsteps-and-maps',
    tag: 'form',
    classes: ['footsteps'],
    position: { width: 480 },
    window: { title: 'Footsteps and Maps', resizable: false },
    actions: {
      playToggle: GhostApplication.#playToggle,
      createGhost: GhostApplication.#createGhost,
      removeGhost: GhostApplication.#removeGhost,
    }
  };

  static PARTS = {
    form: {
      template: 'modules/footsteps-and-maps/scripts/ghostApplication.hbs'
    }
  };

  async _prepareContext(options) {
    return {
      progressBar: this.totalProgress * 100,
      mapVersion: this.mapVersion,
      mapLevel: this.mapLevel,
    };
  }

  /////////////////////////////
  // Action Handlers         //
  /////////////////////////////

  static #playToggle(event, target) {
    game.modules.get('footsteps-and-maps')?.api?._playToggle();
  }

  static #createGhost(event, target) {
    game.modules.get('footsteps-and-maps')?.api?._makeGhost();
  }

  static #removeGhost(event, target) {
    game.modules.get('footsteps-and-maps')?.api?._removeGhosts();
  }

  /////////////////////////////
  // Lifecycle               //
  /////////////////////////////

  _onRender(context, options) {
    const el = this.element;

    // Timeline slider
    const slider = el.querySelector('.footsteps-and-maps-timelineSlider');
    slider.addEventListener('mousedown', (event) => this.mousedownGhostSlider(event));
    slider.addEventListener('input', (event) => this.dragGhostSlider(event));
    slider.addEventListener('change', (event) => this.changeGhostSlider(event));

    // Version radios
    el.querySelectorAll('input[name="footsteps-and-maps-map-version"]').forEach(radio => {
      radio.addEventListener('change', (event) => this.radioVersion(event));
    });

    // Level radios
    el.querySelectorAll('input[name="footsteps-and-maps-floor"]').forEach(radio => {
      radio.addEventListener('change', (event) => this.radioLevel(event));
    });

    // Speed selector
    el.querySelector('.footsteps-and-maps-playSpeed')
      .addEventListener('change', (event) => this.selectSpeed(event));
  }

  _onClose(options) {
    game.modules.get('footsteps-and-maps')?.api?._removeGhosts();
  }

  /////////////////////////////
  // Controller Functions    //
  /////////////////////////////

  dragGhostSlider(event) {
    this.totalProgress = event.currentTarget.value / 100;
    game.modules
      .get('footsteps-and-maps')
      ?.api?._dragGhostSlider(this.totalProgress);
  }

  mousedownGhostSlider(event) {
    game.modules.get('footsteps-and-maps')?.api?._mousedownGhostSlider();
  }

  changeGhostSlider(event) {
    this.totalProgress = event.currentTarget.value / 100;
    game.modules
      .get('footsteps-and-maps')
      ?.api?._changeGhostSlider(this.totalProgress);
  }

  radioVersion(event) {
    this.mapVersion = event.currentTarget.value;
    game.modules
      .get('footsteps-and-maps')
      ?.api?._selectMapVersion(this.mapVersion);
  }

  radioLevel(event) {
    this.mapLevel = event.currentTarget.value;
    game.modules.get('footsteps-and-maps')?.api?._selectMapLevel(this.mapLevel);
  }

  selectSpeed(event) {
    this.playbackSpeed = Number(event.currentTarget.value);
    game.modules
      .get('footsteps-and-maps')
      ?.api?._setPlaybackSpeed(this.playbackSpeed);
  }

  /////////////////////////////
  // Called from core module  //
  //////////////////////////////

  setToggleButton(isPlaying) {
    const el = this.element;
    if (!el) return;
    const playIcon = el.querySelector('.fa-play');
    const pauseIcon = el.querySelector('.fa-pause');
    if (isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    }
  }

  updateTimeline() {
    const el = this.element;
    if (!el) return;
    const slider = el.querySelector('.footsteps-and-maps-timelineSlider');
    if (slider) slider.value = this.totalProgress * 100;
  }
}
