import { CharacterService } from './../../character.service';
import {Output, EventEmitter, Component, OnInit, Input } from '@angular/core';
import { Character } from 'src/app/character';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-character-create',
  templateUrl: './character-create.component.html',
  styleUrls: ['./character-create.component.css']
})
export class CharacterCreateComponent implements OnInit {

  @Input() public id: number;
  @Input() public name: string;
  @Input() public description: string;
  @Input() public strength: number;
  @Input() public dexterity: number;
  @Input() public health: number;
  @Input() public rarity: string;
  @Input() public vitality: number;
  @Output() submitted = new EventEmitter();

  constructor( private cs: CharacterService) { }

  ngOnInit() {

  }

  onSubmit(charForm: NgForm) {
    const ch = new Character(this.id, this.name, this.description,
      this.strength, this.dexterity, this.vitality, this.health, this.rarity);
    console.log(ch);
    this.cs.createCharacter(ch).subscribe((obj: Object) => {
    console.log(obj);
    this.submitted.emit('Submit!');
    charForm.reset();
  });
  }

}
