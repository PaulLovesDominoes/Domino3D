# <pattern-name>.json reference

Schema and conventions for the pattern data files in `patterns/<pattern-name>.json`. The name of the pattern will be the same as the file name, minus the ".json" extension. For example, the name of the pattern in the "wall.json" fill will be "wall".

The purpoose of a pattern file is to specify how to create repeating patterns of dominoes in three dimensions to create buildable domino structures.

## Introduction

### Patterns, Tiles, Cells, and Dominoes

A pattern is made up of tiles which can be repeated in all three dimensions.

Each tile is made up of a square grid of cells. The size of a tile (number of cells in all directions) is fixed for the entire pattern. There can be many different types of tiles. Each type of tile specifies a different set dominoes at various positions and rotations. Tile types can be combined into a wide range of sequential patterns to create the domino structure required. The dominoes in a tile typically overlap with neighboring tiles, such that their dominoes support each other.

Each cell position within a tile may be filled with either 1 or 0 dominoes, specified with a position (e.g. standing, sideways, and flat) oriented in a particular rotation, or 'null' to indicate there is no domino. See below for more discussion on positions and rotations.

For example, if a tile has the following dimensions:

    "width":{"cells":1, "repeat":"yes"},
    "height":{"cells":4, "repeat":"yes"}
    "depth":{"cells":2, "repeat":"no"},

That means a single tile contains 8 cells (width x height x depth). Since each cell can contain a a single domino, this means that each tile can contain, at most, eight dominoes. In practice, most tiles will only fill half their cells with dominoes.

Tiles of different types can "fit together" - e.g. be compatible in the X, Y, and Z dimensions. In practice, this means that the dominoes specified by one tile interleave with the next tile so that all the dominoes are supported by other dominoes.

Tiles specify what other tile types are allowed in the X, Y, and Z dimensions with the `next` element. This could be a list of allowed tile types or null (meaning no additional tiles allowed in that dimension) or the special keyword "any" (meaning no restriction).

### Positions and Rotations

When dominoes are used in patterns they can be rotated around the Y-axis that goes through the domino's origin point as specified in the cell type's `domino_origin` value. Rotations in patterns are specified with a position name and a rotation value. Rotations are always around a Y-Axis (e.g. like a record player record) that goes through the `domino_origin` point, as specified in the cell type.

As an example, take a standard, standing domino, which has [width, height, depth] = [24, 48, 7.5]. This domino be a rectangle with the following physical dimensions in the standard three.js coordinate system:  X=(0 to 24), Y=(0 to 48), Z=(0, 7.5)

Further suppose that the origin for the chosen cell type is specified as [3.75, 0, 3.75]. This will be a point that is under the domino.

A rotation of the domino by 90-degrees will rotate it counter-clockwise around a Y axis specified by the equation X=3.75, Z=3.75. This will result in a new rectangle with the physical dimensions X=(0 to 7.5), Y=(0 to 48), Z=(7.5 to -16.5) .

### Construction

It is assumed that construction begins in the lower left front of the structure, and then proceeds to the right (positive X), then towards the back (negative Z) and then, finally, up (positive Y).

The first (left-most, front-most, bottom-most) tile will be chosen from the `start_tiles` options, and must be specified before construction begins.

Construction continues choosing tiles that fit, first from left-to-right, then front-to-back, then bottom to top.

When reaching a structure boundary, tiles should be chosen where the `next` element is "null" indicating this is the last tile in that dimension (in essence, the "fit" for the tile in that dimension is no next tile).

## Top-level elements

- `description` - The user-friendly description of the pattern
- `cell_type` - The name of the cell type that specifies the dimensions and overlap of the cell when repeated.
    - Available cell types are listed in the dimensions.json file.
- `start_tiles` - A list of named tile types which can start the structure
    -  When building the structure, the caller must specify which of these tile types to start with

## `tile_size`

`tile_size` specifies the size of a tile as a number of cells in all three dimensions. All tiles, regardless of type, are the same size for the entire pattern.

`tile_size` contains the following sub-elements:

- `width` - The width (X dimension) of the tile
- `height` - the height (Y dimension) of the tile, sometimes called the number of layers
- `depth` - The depth (Z dimension) of the tile

Each element, `width`, `height`, and `depth` must contain two sub-elements:

- `cells` - The integer number of cells in the specified dimension
    - All tiles must be an integer number of cells in size
- `repeat` - Whether or not tiles in the specified dimension can be repeated, can be 'yes' or 'no'
    - Note that repeat = 'yes' does not mean that the exact same tile type must be repeated, only that tiles can be repeated in that dimension


## `tile_types`

This section contains a list of named tile types that can be combined to create the full domino structure.

Each tile type is a specific 3-dimensional arrangement of dominoes that fill up the cells of a tile. There can be many different types of tiles (e.g. many different arrangements of dominoes). Different types of tiles can "fit" with each other in any dimension. When two tiles "fit", it means that their dominoes interleave and support each other without conflicts. A conflict would be when two dominoes are trying to share the same physical space.

## `tile_types.<tile-type-name>`

Each named tile type can contain three sub-elements:
- `description` - a user-friendly description of the type of tile
- `layout` - specifies the arrangement of dominoes to create a tile of this type
- `next` - specifies what tile types are compatible (will fit) with this tile, in all three dimensions

### `<tile-type-name>.layout`

The layout section specifies how to arrange the dominoes for all cells within the tile. It is a list of list of lists:
- Top-level list:  One entry for each cell in the X dimension (must be the same length as tile_size.width.cells)
- Second-level list:  One entry for each cell in the Y dimension (must be the same length as tile_size.height.cells)
- Third-level list:  One entry for each cell in the Z dimension (must be the same length as tile_size.depth.cells)

Each entry for the third-level list will be an actual domino to be placed at the origin position of that cell within the tile. Each domino can be specified as:
- `<position-name>` - The domino in the named position is placed with no rotation
- `<position-name>:<rotation>` - The domino in the named position is rotated around the Y axis that goes through the origin point specified in the cell-type
- `null` - There is no domino at this position

### `<tile-type-name>.next`

This section specifies what tile types are compatible (e.g. will fit) with the current tile type in all three dimensions.

This `next` element contains a 3-element list, one for each dimension, X, Y and Z. Each element can contain any of the following:
- A named tile type: This is the only option for adding a tile in the specified dimension
- A nested list of named tile types:  Any of the specified tile types are compatible in the specified dimension
- The keyword "any": Any tile type is allowed in the specified dimension
- `null`:  No tile is allowed in the specified dimension, this represents the end of the structure in that dimension

#### How to choose the next tile type if there are multiple options

When there are multiple options specified in the `next` field, there are multiple ways to choose which tile type should be next.

1. The type needs to be compatible in all dimensions
    - Therefore, choose the tile which is compatible with all three of the prior tiles to which it is touching (e.g. left, back, up).
2. If the tile is the last tile in the structure for a particular dimension, choose the tile type which has "null" in their `next` element for the boundary dimension
    - For example, when building a wall, 
3. Similarly, if the tile is NOT the last tile of the structure, choose a tile type which does _not_ have "null" in its associated `next` field

