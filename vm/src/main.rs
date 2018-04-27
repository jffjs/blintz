extern crate blintz_vm;

use blintz_vm::chunk::Chunk;
use blintz_vm::opcode::OpCode;

fn main() {
    let mut chunk = Chunk::new();
    chunk.write_op(OpCode::OpReturn);

}
