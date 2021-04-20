class CanvasPainting extends HTMLCanvasElement {
  constructor () {
    super()
    this.$setup()
    if (this.beforeInit) this.beforeInit()
    if (this.$options.autoInit) {
      this.$init()
      if (this.afterInit) this.afterInit()
    }
  }
  
  $setup () {
    this.ctx2D = this.getContext('2d')
    this.$frameRequest = null
    
    this.$options = {
      width: parseInt(getComputedStyle(this.parentElement).width),
      height: parseInt(getComputedStyle(this.parentElement).height),
      autoInit: true,
      clear: true,
      showStats: false
    }
    
    this.$scope = {
      background: 'transparent'
    }
    
    if (this.options)
      this.$options = Object.assign({}, this.$options, this.options())
    
    if(!this.$options.clear)
      this.$scope.background = false
    
    this.$updateSize(this.$options.width, this.$options.height)
    window.addEventListener('resize', () => {
      this.$updateSize()
      this.$clear()
      if (this.draw) this.draw()
    })
    
    if (this.scope)
      this.$scope = Object.assign({}, this.$scope, this.scope())
    
    if (this.dataset)
      this.$scope = Object.assign({}, this.$scope, this.dataset)
      
    if(this.$options.showStats) {
      const src = 'https://mrdoob.github.io/stats.js/build/stats.min.js'
      const statsScript = document.querySelector(`script[src="${src}"]`)
      
      const setupStats = () => {
        this.$stats = new Stats()
        this.$stats.dom.style.position = 'absolute'
        this.$stats.dom.style.left = 'initial'
        this.$stats.dom.style.top = 'initial'
        this.parentElement.insertBefore(this.$stats.dom, this)
      }
      
      if (statsScript) setupStats()
      else {
        const script = document.createElement('script')
        script.src = src
        script.onload = setupStats
        document.head.appendChild(script)
      }
    }
  }
  
  $init () {
    this.$clear()
    this.draw()
    
    if (this.loop) this.$loop()
  }
  
  $loop () {
    this.$clear()
    this.loop()
    this.draw()

    if (this.$options.showStats && this.$stats)
      this.$stats.update()

    this.$frame(this.$loop)
  }
  
  $frame (callback) {
    const requestFrame = window.requestAnimationFrame ||
                         window.webkitRequestAnimationFrame ||
                         window.mozRequestAnimationFrame ||
                         window.msRequestAnimationFrame ||
                         function (cb) { setTimeout(cb, 50/3) }
    
    return this.$frameRequest = requestFrame(() => callback.call(this))
  }
  
  $stop () {
    const cancelFrame = window.cancelAnimationFrame ||
                        window.mozCancelAnimationFrame ||
                        clearTimeout
    
    cancelFrame(this.$frameRequest)
    this.$frameRequest = null
  }
  
  $updateSize (width, height) {
    this.width = width || parseInt(getComputedStyle(this.parentElement).width)
    this.height = height || parseInt(getComputedStyle(this.parentElement).height)
  }
  
  $clear (color = this.$scope.background) {
    if (color === undefined)
      return
    else if (color === 'transparent')
      return this.ctx2D.clearRect(0, 0, this.width, this.height)
    else {
      this.ctx2D.save()
      this.ctx2D.fillStyle = color
      this.ctx2D.fillRect(0, 0, this.width, this.height)
      this.ctx2D.restore()
    }
  }
}

export default CanvasPainting
