export default class Cropper{
    constructor(){
        console.log('this is works');
        this.onOrderClick = () =>{};
    }

    onOrderClick(func){
        this.onOrderClick = func();
    }
}
