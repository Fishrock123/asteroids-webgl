# "Asteroids" WebGL

_Intended to match the original source as much as possible._

This is the extracted version of a game developed in late 2017 as an easter egg within [NodeSource][]'s Node.js monitoring platform, [N|Solid][].

As part of the 3.0 release of N|Solid, the primary interface included a [scatterplot][] view of connected Node.js processes, which had been updated to use WebGL. For fun, and as a demonstration of what capabilities were granted by this change, I wrote this simple game that could be accessed by entering "asteroids" into the metric search field of the scatterplot's axis selector.

I believe this project to be interesting almost entirely due to its constraints, those being roughly:
- Be a game.
- Look like it belonged in the scatterplot.
- Be as un-intrusive as possible.
- Require as little maintenance as possible.
- Use only existing shaders.

I believe those goals were achieved as well as the could be.

The entire game works in the scatterplot container by having react render `AsteroidsComponent` on top of everything, and then doing a sort of hijacking / injection on the `scatterplot` reference (which normally runs most of the scatterplot WebGL logic and holds the `gl` instance), and 'hot' replacing it with `FakeScatterplot`. This was in part done to allow the grid lines and tick markers to continue to update with live process data.

The only hooks into the original `Scatterplot` react component were as follows, allowing for near-complete encapsulation while still using the same canvas, React state, and WebGl resources.

```js
```

## License

Copyright 2017-2020 Jeremiah Senkpiel

All Rights Reserved

[NodeSource]: https://nodesource.com/
[N|Solid]: https://nodesource.com/products/nsolid
[scatterplot]: https://en.wikipedia.org/wiki/Scatter_plot
