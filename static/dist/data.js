window.EMBEDDED_DOMINO_DATA = {
  "dimensions": {
    "unit": "mm",
    "domino": {
      "width": 24,
      "height": 48,
      "depth": 7.5,
      "positions": {
        "standing": "w,h,d",
        "sideways": "h,w,d",
        "flat": "h,d,w"
      }
    },
    "cell_types": {
      "standard": {
        "description": "Standard 3D domino structure cell used for most structures.",
        "domino_origin": [
          3.75,
          0,
          3.75
        ],
        "width": {
          "size": 48,
          "overlap": 7.5
        },
        "height": {
          "size": 24,
          "overlap": 0
        },
        "depth": {
          "size": 48,
          "overlap": 7.5
        }
      },
      "field": {
        "description": "Standard field spacing",
        "domino_origin": [
          3.75,
          0,
          3.75
        ],
        "width": {
          "size": 15,
          "overlap": 0
        },
        "height": {
          "size": 48,
          "overlap": 0
        },
        "depth": {
          "size": 31.5,
          "overlap": 0
        }
      },
      "sideways-field": {
        "description": "Sideways field spacing",
        "domino_origin": [
          3.75,
          0,
          3.75
        ],
        "width": {
          "size": 15,
          "overlap": 0
        },
        "height": {
          "size": 24,
          "overlap": 0
        },
        "depth": {
          "size": 55.5,
          "overlap": 0
        }
      }
    }
  },
  "patterns": {
    "1x1-tower": {
      "description": "A 1x1 tower, with 2 dominoes on every layer",
      "cell_type": "standard",
      "tile_size": {
        "width": {
          "cells": 2,
          "repeat": "no"
        },
        "height": {
          "cells": 2,
          "repeat": "yes"
        },
        "depth": {
          "cells": 2,
          "repeat": "no"
        }
      },
      "start_tiles": [
        "start"
      ],
      "tile_types": {
        "start": {
          "description": "The entire 1x1 tower structure is a single tile type.",
          "layout": [
            [
              [
                "sideways:90",
                null
              ],
              [
                "sideways",
                "sideways"
              ]
            ],
            [
              [
                "sideways:90",
                null
              ],
              [
                null,
                null
              ]
            ]
          ],
          "next": [
            null,
            "any",
            null
          ]
        }
      }
    },
    "field": {
      "description": "Standard field with domino spacing.",
      "cell_type": "field",
      "tile_size": {
        "width": {
          "cells": 1,
          "repeat": "yes"
        },
        "height": {
          "cells": 1,
          "repeat": "no"
        },
        "depth": {
          "cells": 1,
          "repeat": "yes"
        }
      },
      "start_tiles": [
        "start"
      ],
      "tile_types": {
        "start": {
          "description": "There's a single tile type for fields",
          "layout": [
            [
              [
                "standing:90"
              ]
            ]
          ],
          "next": [
            "any",
            null,
            "any"
          ]
        }
      }
    },
    "sideways-field": {
      "description": "Sideways field with domino spacing.",
      "cell_type": "sideways-field",
      "tile_size": {
        "width": {
          "cells": 1,
          "repeat": "yes"
        },
        "height": {
          "cells": 1,
          "repeat": "no"
        },
        "depth": {
          "cells": 1,
          "repeat": "yes"
        }
      },
      "start_tiles": [
        "start"
      ],
      "tile_types": {
        "start": {
          "description": "There's a single tile type for fields",
          "layout": [
            [
              [
                "sideways:90"
              ]
            ]
          ],
          "next": [
            "any",
            null,
            "any"
          ]
        }
      }
    },
    "step-wall": {
      "description": "A standard wall structure",
      "cell_type": "standard",
      "tile_size": {
        "width": {
          "cells": 1,
          "repeat": "yes"
        },
        "height": {
          "cells": 3,
          "repeat": "yes"
        },
        "depth": {
          "cells": 2,
          "repeat": "no"
        }
      },
      "start_tiles": [
        "start-a",
        "start-b",
        "start-c"
      ],
      "tile_types": {
        "start-a": {
          "layout": [
            [
              [
                "sideways",
                "sideways"
              ],
              [
                "sideways:90",
                null
              ],
              [
                "sideways:90",
                null
              ]
            ]
          ],
          "next": [
            "middle-b",
            "any",
            null
          ]
        },
        "start-b": {
          "layout": [
            [
              [
                "sideways:90",
                null
              ],
              [
                "sideways",
                "sideways"
              ],
              [
                "sideways:90",
                null
              ]
            ]
          ],
          "next": [
            "middle-c",
            "any",
            null
          ]
        },
        "start-c": {
          "layout": [
            [
              [
                "sideways:90",
                null
              ],
              [
                "sideways:90",
                null
              ],
              [
                "sideways",
                "sideways"
              ]
            ]
          ],
          "next": [
            "middle-a",
            "any",
            null
          ]
        },
        "middle-a": {
          "layout": [
            [
              [
                "sideways",
                "sideways"
              ],
              [
                "sideways:90",
                null
              ],
              [
                null,
                null
              ]
            ]
          ],
          "next": [
            [
              "middle-b",
              "end-b"
            ],
            "any",
            null
          ]
        },
        "middle-b": {
          "layout": [
            [
              [
                null,
                null
              ],
              [
                "sideways",
                "sideways"
              ],
              [
                "sideways:90",
                null
              ]
            ]
          ],
          "next": [
            [
              "middle-c",
              "end-c"
            ],
            "any",
            null
          ]
        },
        "middle-c": {
          "layout": [
            [
              [
                "sideways:90",
                null
              ],
              [
                null,
                null
              ],
              [
                "sideways",
                "sideways"
              ]
            ]
          ],
          "next": [
            [
              "middle-a",
              "end-a"
            ],
            "any",
            null
          ]
        },
        "end-a": {
          "layout": [
            [
              [
                "sideways:90",
                null
              ],
              [
                "sideways:90",
                null
              ],
              [
                null,
                null
              ]
            ]
          ],
          "next": [
            null,
            "any",
            null
          ]
        },
        "end-b": {
          "layout": [
            [
              [
                null,
                null
              ],
              [
                "sideways:90",
                null
              ],
              [
                "sideways:90",
                null
              ]
            ]
          ],
          "next": [
            null,
            "any",
            null
          ]
        },
        "end-c": {
          "layout": [
            [
              [
                "sideways:90",
                null
              ],
              [
                null,
                null
              ],
              [
                "sideways:90",
                null
              ]
            ]
          ],
          "next": [
            null,
            "any",
            null
          ]
        }
      }
    },
    "tower": {
      "description": "A standard rectangular cuboid structure (e.g. tower, cube, etc.)",
      "cell_type": "standard",
      "tile_size": {
        "width": {
          "cells": 1,
          "repeat": "yes"
        },
        "height": {
          "cells": 4,
          "repeat": "yes"
        },
        "depth": {
          "cells": 1,
          "repeat": "yes"
        }
      },
      "start_tiles": [
        "start"
      ],
      "tile_types": {
        "start": {
          "layout": [
            [
              [
                "sideways:90"
              ],
              [
                "sideways"
              ],
              [
                "sideways:90"
              ],
              [
                "sideways"
              ]
            ]
          ],
          "next": [
            [
              "front-a",
              "front-end"
            ],
            "any",
            [
              "middle-a-start",
              "rear-start"
            ]
          ]
        },
        "front-a": {
          "layout": [
            [
              [
                "sideways:90"
              ],
              [
                null
              ],
              [
                "sideways"
              ],
              [
                null
              ]
            ]
          ],
          "next": [
            "front-b",
            "any",
            [
              "middle-aa",
              "rear-a"
            ]
          ]
        },
        "front-b": {
          "layout": [
            [
              [
                "sideways:90"
              ],
              [
                "sideways"
              ],
              [
                null
              ],
              [
                "sideways"
              ]
            ]
          ],
          "next": [
            [
              "front-a",
              "front-end"
            ],
            "any",
            [
              "middle-ab",
              "rear-b"
            ]
          ]
        },
        "front-end": {
          "layout": [
            [
              [
                "sideways:90"
              ],
              [
                null
              ],
              [
                "sideways:90"
              ],
              [
                null
              ]
            ]
          ],
          "next": [
            null,
            "any",
            [
              "middle-a-end",
              "rear-end"
            ]
          ]
        },
        "middle-a-start": {
          "layout": [
            [
              [
                null
              ],
              [
                "sideways"
              ],
              [
                null
              ],
              [
                "sideways:90"
              ]
            ]
          ],
          "next": [
            [
              "middle-aa",
              "middle-a-end"
            ],
            "any",
            "middle-b-start"
          ]
        },
        "middle-aa": {
          "layout": [
            [
              [
                null
              ],
              [
                null
              ],
              [
                "sideways"
              ],
              [
                "sideways:90"
              ]
            ]
          ],
          "next": [
            "middle-ab",
            "any",
            "middle-ba"
          ]
        },
        "middle-ab": {
          "layout": [
            [
              [
                null
              ],
              [
                "sideways"
              ],
              [
                null
              ],
              [
                "sideways:90"
              ]
            ]
          ],
          "next": [
            [
              "middle-aa",
              "middle-a-end"
            ],
            "any",
            "middle-bb"
          ]
        },
        "middle-a-end": {
          "layout": [
            [
              [
                null
              ],
              [
                null
              ],
              [
                null
              ],
              [
                "sideways:90"
              ]
            ]
          ],
          "next": [
            null,
            "any",
            "middle-b-end"
          ]
        },
        "middle-b-start": {
          "layout": [
            [
              [
                "sideways:90"
              ],
              [
                "sideways"
              ],
              [
                "sideways:90"
              ],
              [
                null
              ]
            ]
          ],
          "next": [
            [
              "middle-ba",
              "middle-b-end"
            ],
            "any",
            [
              "middle-a-start",
              "rear-start"
            ]
          ]
        },
        "middle-ba": {
          "layout": [
            [
              [
                "sideways:90"
              ],
              [
                null
              ],
              [
                "sideways"
              ],
              [
                null
              ]
            ]
          ],
          "next": [
            "middle-bb",
            "any",
            [
              "middle-aa",
              "rear-a"
            ]
          ]
        },
        "middle-bb": {
          "layout": [
            [
              [
                "sideways:90"
              ],
              [
                "sideways"
              ],
              [
                null
              ],
              [
                null
              ]
            ]
          ],
          "next": [
            [
              "middle-ba",
              "middle-b-end"
            ],
            "any",
            [
              "middle-ab",
              "rear-b"
            ]
          ]
        },
        "middle-b-end": {
          "layout": [
            [
              [
                "sideways:90"
              ],
              [
                null
              ],
              [
                "sideways:90"
              ],
              [
                null
              ]
            ]
          ],
          "next": [
            null,
            "any",
            [
              "middle-a-end",
              "rear-end"
            ]
          ]
        },
        "rear-start": {
          "layout": [
            [
              [
                null
              ],
              [
                "sideways"
              ],
              [
                null
              ],
              [
                "sideways"
              ]
            ]
          ],
          "next": [
            [
              "rear-a",
              "rear-end"
            ],
            "any",
            null
          ]
        },
        "rear-a": {
          "layout": [
            [
              [
                null
              ],
              [
                null
              ],
              [
                "sideways"
              ],
              [
                null
              ]
            ]
          ],
          "next": [
            "rear-b",
            "any",
            null
          ]
        },
        "rear-b": {
          "layout": [
            [
              [
                null
              ],
              [
                "sideways"
              ],
              [
                null
              ],
              [
                "sideways"
              ]
            ]
          ],
          "next": [
            [
              "rear-a",
              "rear-end"
            ],
            "any",
            null
          ]
        },
        "rear-end": {
          "layout": [
            [
              [
                null
              ],
              [
                null
              ],
              [
                null
              ],
              [
                null
              ]
            ]
          ],
          "next": [
            null,
            "any",
            null
          ]
        }
      }
    },
    "wall": {
      "description": "A standard wall structure",
      "cell_type": "standard",
      "tile_size": {
        "width": {
          "cells": 1,
          "repeat": "yes"
        },
        "height": {
          "cells": 4,
          "repeat": "yes"
        },
        "depth": {
          "cells": 2,
          "repeat": "no"
        }
      },
      "start_tiles": [
        "start-back",
        "start-front"
      ],
      "tile_types": {
        "start-back": {
          "description": "The left-hand start of the wall with l2 domino facing back.",
          "layout": [
            [
              [
                "sideways:90",
                null
              ],
              [
                "standing:90",
                "sideways"
              ],
              [
                null,
                "standing"
              ],
              [
                "sideways",
                null
              ]
            ]
          ],
          "next": [
            "middle-front",
            "any",
            null
          ]
        },
        "start-front": {
          "description": "The left-hand start of the wall with l2 domino facing front.",
          "layout": [
            [
              [
                "sideways:90",
                null
              ],
              [
                "sideways",
                "standing:-90"
              ],
              [
                "standing",
                null
              ],
              [
                null,
                "sideways"
              ]
            ]
          ],
          "next": [
            "middle-back",
            "any",
            null
          ]
        },
        "middle-back": {
          "description": "A middle section in the wall with l2 domino facing back.",
          "layout": [
            [
              [
                "sideways:90",
                null
              ],
              [
                null,
                "sideways"
              ],
              [
                "sideways:90",
                null
              ],
              [
                "sideways",
                null
              ]
            ]
          ],
          "next": [
            [
              "middle-front",
              "end-back"
            ],
            "any",
            null
          ]
        },
        "middle-front": {
          "description": "A middle section in the wall with l2 domino facing front.",
          "layout": [
            [
              [
                "sideways:90",
                null
              ],
              [
                "sideways",
                null
              ],
              [
                "sideways:90",
                null
              ],
              [
                null,
                "sideways"
              ]
            ]
          ],
          "next": [
            [
              "middle-back",
              "end-front"
            ],
            "any",
            null
          ]
        },
        "end-back": {
          "description": "A end section in the wall with l2 sideways domino (from the prior tile) facing back.",
          "layout": [
            [
              [
                "sideways:90",
                null
              ],
              [
                "standing:90",
                null
              ],
              [
                null,
                "standing:-180"
              ],
              [
                null,
                null
              ]
            ]
          ],
          "next": [
            null,
            "any",
            null
          ]
        },
        "end-front": {
          "description": "A end section in the wall with l2 sideways domino (from the prior tile)  facing front.",
          "layout": [
            [
              [
                "sideways:90",
                null
              ],
              [
                null,
                "standing:-90"
              ],
              [
                "standing:180",
                null
              ],
              [
                null,
                null
              ]
            ]
          ],
          "next": [
            null,
            "any",
            null
          ]
        }
      }
    }
  }
};
