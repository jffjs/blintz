use failure::Error;
use num_traits::FromPrimitive;

use chunk::Chunk;
use debug::disassemble_instruction;
use opcode::OpCode;
use opcode::OpCode::*;
use value::Value;

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
    stack: Vec<Value>,
}

impl VM {
    pub fn new() -> VM {
        VM { ip: 0, stack: vec![] }
    }

    pub fn interpret(&mut self, chunk: &Chunk) -> InterpretResult {
        self.ip = 0;

        self.run(chunk)
    }

    fn run(&mut self, chunk: &Chunk) -> InterpretResult {
        loop {
            if cfg!(feature = "trace_execution") {
                print!("          ");
                for val in &self.stack {
                    print!("[ {} ]", val);
                }
                print!("\n");
                disassemble_instruction(chunk, self.ip);
            }

            match OpCode::from_u8(self.read_byte(chunk)) {
                Some(opcode) => match opcode {
                    OpReturn => {
                        println!("{}", self.stack.pop().unwrap());
                        return Ok(());
                    },
                    OpConstant => {
                        let constant = self.read_constant(chunk);
                        self.stack.push(constant);
                    },
                    OpConstantLong => {
                        let constant = self.read_constant_long(chunk);
                        self.stack.push(constant);
                    },
                    OpAdd => {
                        let b = self.stack.pop().unwrap();
                        let a = self.stack.pop().unwrap();
                        self.stack.push(a + b);
                    },
                    OpSubtract => {
                        let b = self.stack.pop().unwrap();
                        let a = self.stack.pop().unwrap();
                        self.stack.push(a - b);
                    },
                    OpMultiply => {
                        let b = self.stack.pop().unwrap();
                        let a = self.stack.pop().unwrap();
                        self.stack.push(a * b);
                    },
                    OpDivide => {
                        let b = self.stack.pop().unwrap();
                        let a = self.stack.pop().unwrap();
                        self.stack.push(a / b);
                    },
                    OpNegate => {
                        let val = -self.stack.pop().unwrap();
                        self.stack.push(val);
                    }
                },
                None => continue
            }
        }
    }

    fn read_byte(&mut self, chunk: &Chunk) -> u8 {
        self.ip += 1;
        chunk.code[self.ip -1]
    }

    fn read_constant(&mut self, chunk: &Chunk) -> Value {
        let i = self.read_byte(chunk);
        chunk.constants.values[i as usize]
    }

    fn read_constant_long(&mut self, chunk: &Chunk) -> Value {
        let b1 = (self.read_byte(chunk) as usize) << 16;
        let b2 = (self.read_byte(chunk) as usize) << 8;
        let b3 = self.read_byte(chunk) as usize;
        let i = b3 | b2 | b1;
        chunk.constants.values[i as usize]
    }
}
