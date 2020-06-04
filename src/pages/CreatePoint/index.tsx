import React, { useState, useEffect, FormEvent } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import { FiArrowLeft } from 'react-icons/fi';
import './styles.css';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import NoImg from '../../assets/noimg.png';
import { LeafletMouseEvent } from 'leaflet';

interface Item {
    id: number,
    title: string,
    image_url: string,
};

interface IBGEUFResponse {
    sigla: string,
};

interface IBGECityResponse {
    nome: string,
};

const CreatePoint = () => {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [whatsapp, setWhatsapp] = useState<string>('');
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [uf, setUf] = useState<string>('0');
    const [city, setCity] = useState<string>('0');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);


    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const history = useHistory();

    useEffect(() => {
        api.get('items')
            .then(response => {
                setItems(response.data);
            });
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then(response => {
                setUfs(response.data.map(uf => uf.sigla).sort());
            });
    }, []);

    useEffect(() => {
        uf !== '0'
        && axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
            .then(response => {
                setCities(response.data.map(city => city.nome).sort());
            });
    }, [uf]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords 
                || {latitude: -23.5489, longitude: -46.6388};
            setSelectedPosition([latitude, longitude]);
        });
    }, []);

    const handleMapClick = (e: LeafletMouseEvent) => {
        setSelectedPosition([e.latlng.lat, e.latlng.lng])
    }

    const handleSelectedItem = (id: number) => {
        const newItems = selectedItems.includes(id)
            ? selectedItems.filter((itemId: number) => itemId !== id)
            : [...selectedItems, id];
        
        setSelectedItems(newItems);
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        const [latitude, longitude] = selectedPosition;

        const data = {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            uf,
            city,
            items: selectedItems,
        };

        await api.post('points', data);

        history.push('/');
    }

    return (
        <div id="page-create-point">
            <Header returnLink={{ icon: FiArrowLeft, route: '/', text: 'Voltar' }} />
            <form onSubmit={e => handleSubmit(e)}>
                <h1>
                    Cadastro do <br/>
                    ponto de coleta
                </h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="name">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={e => setWhatsapp(e.target.value)}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    
                    <Map center={selectedPosition} zoom={18} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf"
                                id="uf"
                                value={uf}
                                onChange={(e) => setUf(e.target.value)}
                            >
                                <option value="0">Selecione uma UF</option>
                                {
                                    ufs.map(uf => (
                                        <option key={uf} value={uf}>
                                            {uf}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="cidade">Cidade</label>
                            <select 
                                name="cidade"
                                id="cidade"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            >
                                <option value="0">Selecione uma cidade</option>
                                {
                                    cities.map(city => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {
                            items.map((item) => (
                                <li 
                                    key={item.id}
                                    onClick={() => handleSelectedItem(item.id)}
                                    className={selectedItems.includes(item.id) ? 'selected' : ''}
                                >
                                    <img src={item.image_url || NoImg} alt=""/>
                                    <span>{ item.title }</span>
                                </li>
                            ))
                        }
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
};

export default CreatePoint;