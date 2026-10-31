import * as s from 'remix/data-schema'
import * as checks from 'remix/data-schema/checks'
import * as coerce from 'remix/data-schema/coerce'
import * as f from 'remix/data-schema/form-data'

const albumText = s
  .string()
  // Trim before applying the length check so whitespace-only values fail.
  .transform((value) => value.trim())
  .pipe(checks.minLength(1))

const albumYear = coerce
  // Accept finite numbers or numeric text ("1982" → 1982), but reject empty strings.
  .number()
  // Check for a positive whole year without changing the number.
  .refine((value) => Number.isInteger(value) && value > 0, 'Enter a positive whole year')

export const albumForm = f.object({
  title: f.field(albumText),
  artist: f.field(albumText),
  year: f.field(albumYear),
})
