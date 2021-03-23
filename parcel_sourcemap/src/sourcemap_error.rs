use std::io;
use vlq;

// Errors that can occur during processing/modifying source map
#[derive(Copy, Clone, Debug)]
#[repr(u32)]
pub enum SourceMapErrorType {
    // NB: 0 is reserved for OK.
    // The mappings contained a negative line, column, source index, or name index.
    UnexpectedNegativeNumber = 1,

    // The mappings contained a number larger than `u32::MAX`.
    UnexpectedlyBigNumber = 2,

    // Reached EOF while in the middle of parsing a VLQ.
    VlqUnexpectedEof = 3,

    // Encountered an invalid base 64 character while parsing a VLQ.
    VlqInvalidBase64 = 4,

    // VLQ encountered a number that, when decoded, would not fit in a u32.
    VlqOverflow = 5,

    // General IO Error
    IOError = 6,
}

pub struct SourceMapError {
    pub error_type: SourceMapErrorType,
    pub reason: Option<String>,
}

impl SourceMapError {
    pub fn new(error_type: SourceMapErrorType, reason: Option<String>) -> Self {
        Self { error_type, reason }
    }
}

impl From<vlq::Error> for SourceMapError {
    #[inline]
    fn from(e: vlq::Error) -> SourceMapError {
        match e {
            vlq::Error::UnexpectedEof => {
                SourceMapError::new(SourceMapErrorType::VlqUnexpectedEof, None)
            }
            vlq::Error::InvalidBase64(_) => {
                SourceMapError::new(SourceMapErrorType::VlqInvalidBase64, None)
            }
            vlq::Error::Overflow => SourceMapError::new(SourceMapErrorType::VlqOverflow, None),
        }
    }
}

impl From<io::Error> for SourceMapError {
    #[inline]
    fn from(_err: io::Error) -> SourceMapError {
        // TODO: Actually differentiate between IO errors, in theory none of these should ever happen though...
        return SourceMapError::new(SourceMapErrorType::IOError, None);
    }
}
