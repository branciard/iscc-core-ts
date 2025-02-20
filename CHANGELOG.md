# Changelog

All notable changes to this project will be documented in this file.

## [v0.3.0] - 2024-02-20

Iteration 3.
In this iteration the NGI security launch will be planned. During the external security audit, I will also see with the ISCC fondation for a perfect match of the ISO standard support and see with python developer to exchanges and tackle corner cases. Release pipeline will be implemented.

Issues fixed: 
- Upgrade typescript impl to last python Release v1.1.0 (#45)
- Check if all functions of codec.py are implemented into codec.ts and test coverage is ok (#44)
- Verify if migration to typescript of models.py is necessary (#43)
- test "handles 1MiB data robustly" not working (#42)
- Check if workaround on toString('hex') is realy needed (#41)
- clarify NONE and TEXT equal = 0 in subType usage for encode_component codec fonction (#40)

Milestone(s):
- a. Launch NGI external security audit (#27)
- b. Verfiy implementation according to ISO standard publish (#21)
- c. Define and setup release pipeline (#20)
- d. Improve Readme and documentation (#19)
- e. Publish Iteration 2 release 0.3.0 (#29)





