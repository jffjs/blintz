use std::cell::Cell;
use std::cmp::PartialEq;
use num_traits::ToPrimitive;
use opcode::OpCode;
use value::{Value, ValueArray};

pub struct Chunk {
    pub code: Vec<u8>,
    pub constants: ValueArray,
    lines: Vec<LineEncoding>
}

impl Chunk {
    pub fn new() -> Chunk {
        Chunk {
            code: vec![],
            constants: ValueArray::new(),
            lines: vec![]
        }
    }

    pub fn len(&self) -> usize {
        self.code.len()
    }

    pub fn write_byte(&mut self, byte: u8, line: LineNum) {
        self.code.push(byte);
        self.push_line(line);
    }

    pub fn write_op(&mut self, opcode: OpCode, line: LineNum) {
        match opcode.to_u8() {
            Some(byte) => self.write_byte(byte, line),
            None => panic!(format!("Unknown opcode: {:?}", opcode))
        }
    }

    pub fn write_constant(&mut self, value: Value, line: LineNum) {
        if self.constants.len() >= 256 {
            self.write_op(OpCode::OpConstantLong, line);
            let addr = self.add_constant(value);
            let b1 = (addr & 0xff0000) >> 16;
            let b2 = (addr & 0xff00) >> 8;
            let b3 = addr & 0xff;
            self.write_byte(b1 as u8, line);
            self.write_byte(b2 as u8, line);
            self.write_byte(b3 as u8, line);
        } else {
            self.write_op(OpCode::OpConstant, line);
            let addr = self.add_constant(value);
            self.write_byte(addr as u8, line);
        }
    }

    pub fn add_constant(&mut self, value: Value) -> usize {
        self.constants.write_value(value);
        (self.constants.len() - 1)
    }

    pub fn get_line(&self, offset: usize) -> u32 {
        let mut offset_line = 0;
        for line in &self.lines {
            offset_line += line.run.get();

            if offset < offset_line as usize {
                return line.line;
            }
        }

        0
    }

    fn push_line(&mut self, line: LineNum) {
        if self.lines.len() > 0 {
            let last = &self.lines[self.lines.len() - 1];

            if last.line == line {
                last.inc();
                return;
            }
        }
        self.lines.push(LineEncoding::new(line));
    }
}

pub type LineNum = u32;

struct LineEncoding {
    run: Cell<u32>,
    line: LineNum
}

impl LineEncoding {
    fn new(line: u32) -> LineEncoding {
        LineEncoding { run: Cell::new(1), line }
    }

    fn inc(&self) {
        let run = self.run.get();
        self.run.set(run + 1);
    }
}

impl PartialEq for LineEncoding {
    fn eq(&self, other: &LineEncoding) -> bool {
        self.line == other.line
    }
}
