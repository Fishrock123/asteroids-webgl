# "Asteroids" WebGL

My first actually published game, developed in late 2017 as an easter egg within [NodeSource][]'s Node.js monitoring platform, [N|Solid][].

**[Playable on itch.io](https://fishrock.itch.io/asteroids-easter-egg)**

_Intended to match the original source as much as possible. This version has been extracted and the codebase has been sanitized of as much as possible that was not directly related to the asteroids easter-egg._

As part of the 3.0 release of N|Solid, the primary interface included a [scatterplot][] view of connected Node.js processes, which had been updated to use WebGL. For fun, and as a demonstration of what capabilities were granted by this change, I wrote this simple game that could be accessed by entering "asteroids" into the metric search field of the scatterplot's axis selector.

## Constraints

I believe this project to be interesting almost entirely due to its constraints.
Those being roughly:
- Be a game.
- Look like it belonged in the scatterplot.
- Be as un-intrusive to the codebase as possible.
- Require as little maintenance as possible.
- Use only existing shaders.
- Scale to any arbitrary viewport.

I believe all except the last of those goals were effectively achieved.

Had I had more time, visual scaling would have been fixed and asteroids would have been geometric and not the "process cluster" blurry "areas"/"dots". There is also a vertex array reserved in the code for an unused "aim line".

## Game Design

I'm not sure if I'd ever actually played the original Asteroids (or any remake).
At any rate this was intended to only adhere roughly imitate its general design, with "modern" controls, pacing, and difficulty.

Importantly, what was included in the shipped version was dictated by the constrains as described in the Constraints section above.

## Visual Design

Visual design is mostly thanks to [Paul DeVay][], former Design Director at NodeSource.
Paul did the majority of the design for N|Solid 3.0, including the scatterplot, which this easter egg re-used. The game's UI was implemented from custom design references by Paul.

The gridlines and axis markers have been kept as close as possible they were in the original. Due to the relative absence of other visuals, the game feels pretty empty and out if place without them.

The "asteroids" use a shader for an N|Solid 3 feature that was never finalized / released.

## Technical Info

This is built directly on top of web browser fundamentals, without any additional game engine. WebGL access, windowing, and input processing make up the majority of the browser reliance. The game implements a very simple engine, without true entity support, but with distinct logic and render update phases.

Later on, after launch, I switched N|Solid from total direct WebGL to using [regl][] as a light functional intermediate layer for maintainability reasons. I think this was a good choice for that level of WebGL access, and regl is quite nice to work with.

The entire game runs within the scatterplot container by having react render `AsteroidsComponent` on top of everything, and then doing a sort of hijacking / injection on the `scatterplot` reference (which normally runs most of the scatterplot WebGL logic and holds the `gl` instance), and 'hot' replacing it with `FakeScatterplot`. This was in part done to allow the grid lines and tick markers to continue to update with live process data.

The only hooks into the original `Scatterplot` react component were as follows, allowing for near-complete encapsulation while still using the same canvas, React state, and WebGl resources.

```jsx
// Import
const { Asteroids } = require('./asteroids/AsteroidsComponent')

// ...

class Scatterplot extends React.Component {

  // ...

  this.state = {
    // ...
    easterEgg: false
  }

  // ...

  render () {
    return (
      // ...
      {
        state.easterEgg
        ? <Asteroids
          onClose={() => {
            this.preventMouseDrag = false
            this.setState({ easterEgg: false })
          }}
          scatterplot={this.scatterplot}
          overrideHook={override => { this.scatterplot = override }} />
        : null
      }
      // ...
      <AxisSelector
        // ...
        hiddenResultCheck={result => {
          if (result.toLowerCase() === 'asteroids') {
            this.setState({ axisModal: null, easterEgg: true })
            return true
          }
        }}
      />
      // ...
    )
  }

  // ...
}
```

### Scaling

Due to the simplicity of the game, it handles scaling to oddly dimensioned viewports by... not doing anything. Gameplay simply stretches. As all movement is based on absolute space as relative to clip space, movement on the x/y axes is slowed or quickened depending on if the view if larger in the width or height dimension.

However, visuals do not scale as they are absolutely defined relative to pixel size. Unfortunately, as this was also an issue with the real scatterplot.

Due to this, the game plays poorly on large (1080 or 1440) viewports.

## License

Copyright 2017 NodeSource Inc.
Copyright 2020 Jeremiah Senkpiel

All Rights Reserved

_This is due to the somewhat convoluted IP origins of this project._

[NodeSource]: https://nodesource.com/
[N|Solid]: https://nodesource.com/products/nsolid
[scatterplot]: https://en.wikipedia.org/wiki/Scatter_plot
[Paul DeVay]: https://pdv.works/
[regl]: https://github.com/regl-project/regl
