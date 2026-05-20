export default function AddressSelector({addresses,selected,setSelected}:any){

    return(
    
    <div>
    
    <h2 className="text-xl font-bold mb-4">
    Delivery Address
    </h2>
    
    {addresses.map((a:any)=>(
    
    <label
    key={a.id}
    className={`block border p-4 rounded mb-3 ${
    selected===a.id ? "border-black" : ""
    }`}
    >
    
    <input
    type="radio"
    checked={selected===a.id}
    onChange={()=>setSelected(a.id)}
    className="mr-2"
    />
    
    <p className="font-semibold">{a.fullName}</p>
    
    <p>{a.line1}</p>
    
    <p>{a.city} {a.state}</p>
    
    <p>{a.pincode}</p>
    
    </label>
    
    ))}
    
    </div>
    
    )
    
    }