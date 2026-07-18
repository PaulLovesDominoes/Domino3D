# dimensions.json reference

Schema and conventions for `data/dimensions.json`. 

In this document, X, Y, and Z refer to standard three.js dimensions (e.g. like viewing a scene).

## Top-level elements

- `unit` - The physical units for all dimensions
- `domino` - A JSON object specifying the dimensions for a domino
- `cell_types` - A JSON object containing named cell types, see below for more information

## `domino`

This section specifies the physical dimensions and allowed positions of a standard domino.

Each domino can have the following sub-elements:

- `width` - The physical X width of the object
- `height` - The physical Y height of the object
- `depth` - The physical Z depth of the object
- `positions` - a JSON sub-object which contains a list of named possible positions for the domino (see below)

The above describes a domino which is a rectangular prism (e.g. a box) which starts at (0,0,0) and extends to (width, height, depth).

### `objects.<object-name>.positions.<position-name>`

Each domino be placed in different positions, which are named, stable orientations of the domino. Positions are given as an `"X,Y,Z"` string mapping the domino's own `width`/`height`/`depth` onto the Three.js scene axes. For example:

| position   | mapping   | meaning |
|------------|-----------|---------|
| `standing` | `w,h,d`   | width along X, height along Y (standing on its short end), depth along Z |
| `sideways` | `h,w,d`   | height along X (lying on its long edge), width along Y, depth along Z |
| `flat`     | `h,d,w`   | height along X, depth along Y (lying flat), width along Z |

For example, a sideways domino will be a rectangular box which starts at (0,0,0) and extends to (height,width,depth), using the values for height, width, and depth specified above.

## `cell_types`

Each entry under `cell_types` is a named, repeatable 3D volume that domino structures are built from by (typically overlapping) two or three dimensional tiling.

Each cell type can have the following elements:

- `description` - A user-friendly description of the cell type

### Overall dimensions of the cell

Each named structure cell can have the following sub-objects:
- `domino_origin` - specifies an [x,y,z] point the relative origin point for dominoes used in this type of cell.
    - See data/patterns.md for more information.

- `width` - The physical X width of the cell
- `height` - The physical Y height of the cell
- `depth` - The physical Z depth of the cell

Each of the `width`, `height`, and `depth` sub-objects must further contain the following sub-elements:
-  `size` - The physical dimension of the 3D volume of the cell, in the specified units (typically mm)
-  `overlap` - How much the cell will overlap a neighboring cell when the cells are combined together into tiles and patterns

