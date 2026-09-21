# Chemly Auto-Corrector Fix

## Fixed
- Robustly splits reaction species without treating ionic `+` signs as separators.
- Supports compact equations such as `Cr2O72−+Fe2+⟶Cr3+Fe3+`.
- Normalizes Unicode ionic charge notation including U+2212 minus.
- Preserves terminal charge signs when splitting compact ions such as `Cr3+Fe3+`.
- Prevents false "missing ion charge" warnings for already charged ions.
- Keeps element capitalization and redox-specific charge completion.
- Reworked the Auto-Koreksi card to a cleaner, flatter, less visually noisy UI while preserving the existing component/system.

## Verified correction cases
- `Cr2O72−+Fe2+⟶Cr3+Fe3+` -> `Cr2O7^2- + Fe2+ -> Cr3+ + Fe3+`
- `Fe2++MnO4- -> Fe3++Mn2+` -> `Fe2+ + MnO4- -> Fe3+ + Mn2+`
- `Cr3+Fe3+` -> `Cr3+ + Fe3+`
- `MnO4- + Fe2+ -> Mn2+ + Fe3+` remains unchanged
- Lowercase/misformatted redox input still receives capitalization/charge normalization.
