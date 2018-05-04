extern crate blintz_vm;

use blintz_vm::chunk::Chunk;
// use blintz_vm::debug::disassemble_chunk;
use blintz_vm::opcode::OpCode::*;
use blintz_vm::vm::VM;

fn main() {
    let mut vm = VM::new();

    let mut chunk = Chunk::new();
    chunk.write_constant(1.2, 123);
    chunk.write_constant(3.4, 123);
    chunk.write_op(OpAdd, 123);
    chunk.write_constant(5.6, 123);
    chunk.write_op(OpDivide, 123);
    chunk.write_op(OpNegate, 123);
    chunk.write_op(OpReturn, 123);

    // disassemble_chunk(&chunk, "test chunk");

    vm.interpret(&chunk).unwrap();
}
