export type Founder = {
  name: string
  photo: {
    /** Path from public/, starting with /images. Leave empty to show the placeholder. */
    src: string
    /** Describes the photograph for screen readers. */
    alt: string
    /** 1 fills the frame; higher values move closer. Values below 1 are treated as 1. */
    zoom: number
    /** The part of the photo to keep in view, as a percentage. 0 = far left, 100 = far right. */
    focusX: number
    /** 0 = top, 100 = bottom. Only has an effect when zoom is above 1 or the photo is taller than the frame. */
    focusY: number
  }
}

// Edit either photo here. The frames keep their size whatever the photo's dimensions.
export const founders: Founder[] = [
  {
    name: 'Laxman S.',
    photo: {
      src: '/images/brand/founder1.png',
      alt: 'Laxman S. in a dark shirt and sunglasses, seated cross-legged in an armchair against an amber haze',
      zoom: 1,
      focusX: 50,
      focusY: 50,
    },
  },
  {
    name: 'Mathivel T.',
    photo: {
      src: '/images/brand/founder2.png',
      alt: 'Mathivel T. in a dark blazer and black T-shirt, seated cross-legged in an armchair against an amber haze',
      zoom: 1,
      focusX: 50,
      focusY: 50,
    },
  },
]
