extern crate blintz_vm;

use blintz_vm::chunk::Chunk;
use blintz_vm::debug::disassemble_chunk;
use blintz_vm::opcode::OpCode;

fn main() {
    let mut chunk = Chunk::new();

    let constant = chunk.add_constant(1.2);
    chunk.write_op(OpCode::OpConstant, 123);
    chunk.write_byte(constant, 123);

    chunk.write_op(OpCode::OpReturn, 123);

    disassemble_chunk(&chunk, "test chunk");
}
