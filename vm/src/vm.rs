use failure::Error;
use num_traits::FromPrimitive;

use chunk::Chunk;
use opcode::OpCode;

#[derive(Debug, Fail)]
pub enum VmError {
    #[fail(display = "Compile error")]
    CompileError,
    #[fail(display = "Runtime error")]
    RuntimeError
}

pub type InterpretResult = Result<(), Error>;

pub struct VM {
    ip: usize,
}

impl VM {
    pub fn new() -> VM {
        VM { ip: 0 }
    }

    pub fn interpret(&mut self, chunk: &Chunk) -> InterpretResult {
        self.ip = 0;

        self.run(chunk)
    }

    fn run(&mut self, chunk: &Chunk) -> InterpretResult {
        loop {
            match OpCode::from_u8(chunk.code[self.ip]) {
                Some(opcode) => match opcode {
                    OpCode::OpReturn => return Ok(()),
                    _ => return Err(Error::from(VmError::RuntimeError))
                },
                None => continue
            }
        }
    }
}
