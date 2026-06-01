import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Usuario extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true })
  correo: string;

  @Prop({ required: true, unique: true })
  usuario: string;

  @Prop({ required: true })
  contraseña: string;

  @Prop()
  perfil: string;

}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);