import "@stdlib/deploy";
import "./jetton/index.jetton.tact";
message Add {
    amount: Int as uint32;
}

contract SampleTactContract with Deployable, Jetton {
    owner: Address;
    counter: Int as uint32;
    totalSupply: Int as coins;
    content: Cell?;
    mintable: Bool;
    init(owner: Address){
        self.owner = owner;
        self.counter = 0;
        self.mintable = true;
        self.totalSupply = 0;
        self.mint(owner, 10000000000, owner);
    }

     fun add(v: Int) {
        // Check sender
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Invalid sender");
        // Update counter
        self.counter = self.counter + v;
    }

    receive(msg: Add){
        self.add(msg.amount);
    }

    receive("increment"){
        self.add(1);
        self.reply("incremented".asComment());
    }

    get fun counter(): Int {
        return self.counter;
    }
}