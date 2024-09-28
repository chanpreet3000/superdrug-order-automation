import React, {useEffect, useState} from 'react';
import {axiosApi} from "../../axios";
import {MdDelete} from "react-icons/md";
import {Spinner} from "../../utils";
import Input from "../Input";
import Button from "../Button";
import useToast from "../useToast";
import {CardDetails, useAutomation} from "../../context/AutomationContext";

interface CardComponentProps {
  card: CardDetails;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const CardDetailsInput = () => {
  const [cardDetails, setCardDetails] = useState<CardDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    name: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const {showSuccessToast, showErrorToast} = useToast();
  const {
    selectedCardDetails,
    setSelectedCardDetails,
    setCurrentStep,
    totalOrders
  } = useAutomation();
  const totalCardsRequired = (totalOrders + 1) / 2;

  const fetchCardDetails = () => {
    setIsLoading(true);
    axiosApi.get('/card_details')
      .then((response) => {
        setCardDetails(response.data);
      })
      .catch((error) => {
        console.error('Error fetching card details:', error);
        showErrorToast('Failed to fetch card details');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const saveCardDetails = async () => {
    if (!newCard.number || !newCard.name || !newCard.expiryMonth || !newCard.expiryYear || !newCard.cvv) {
      showErrorToast('Please fill in all card details');
      return;
    }
    setIsLoading(true);
    axiosApi.post('/card_details', newCard)
      .then(() => {
        setNewCard({number: '', name: '', expiryMonth: '', expiryYear: '', cvv: ''});
        fetchCardDetails();
        showSuccessToast('Card details saved successfully');
      })
      .catch((error) => {
        console.error('Error saving card details:', error);
        showErrorToast(`${error.response.data.error}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const deleteCardDetails = async (cardNumber: string) => {
    setIsLoading(true);
    axiosApi.delete(`/card_details/${cardNumber}`)
      .then(() => {
        setSelectedCardDetails(prev => prev.filter(card => card.number !== cardNumber));
        fetchCardDetails();
        showSuccessToast('Card details deleted successfully');
      })
      .catch((error) => {
        console.error('Error deleting card details:', error);
        showErrorToast('Failed to delete card details');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const toggleSelection = (card: CardDetails) => {
    setSelectedCardDetails(prev => {
      if (prev.some(c => c.number === card.number)) {
        return prev.filter(c => c.number !== card.number);
      } else {
        return [...prev, card];
      }
    });
  };

  const handleNextStep = () => {
    if (selectedCardDetails.length == totalCardsRequired) {
      showSuccessToast('Card details saved successfully');
      setCurrentStep(prev => prev + 1);
    } else {
      showErrorToast(`Please select exactly ${totalCardsRequired} card(s)`);
    }
  };

  useEffect(() => {
    fetchCardDetails();
  }, []);

  if (isLoading) {
    return <Spinner/>;
  }

  const CardComponent = ({card, isSelected, onSelect, onDelete}: CardComponentProps) => (
    <div
      className={`w-72 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
        isSelected ? 'bg-green-600' : 'bg-gradient-to-br from-gray-800 to-gray-900'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="text-xl font-bold text-white">Credit Card</div>
        <MdDelete
          size={24}
          className="text-red-500 cursor-pointer hover:text-red-700"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        />
      </div>
      <div className="mt-8 text-xl text-white tracking-wider">
        {card.number.replace(/(\d{4})/g, '$1 ').trim()}
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <div className="text-gray-400 text-sm">Card Holder</div>
          <div className="text-white">{card.name}</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm">Expires</div>
          <div className="text-white">{card.expiryMonth}/{card.expiryYear}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-row gap-8 fade-in">
      <div className="flex flex-col gap-4">
        <div className="font-bold text-lg">Add New Card Details</div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Card Number"
            type="text"
            placeholder="1234 5678 9012 3456"
            value={newCard.number}
            onChange={(e) => setNewCard({...newCard, number: e.target.value})}
          />
          <Input
            label="Card Holder Name"
            type="text"
            placeholder="John Doe"
            value={newCard.name}
            onChange={(e) => setNewCard({...newCard, name: e.target.value})}
          />
          <Input
            label="Expiry Month (MM)"
            type="text"
            placeholder="12"
            value={newCard.expiryMonth}
            onChange={(e) => setNewCard({...newCard, expiryMonth: e.target.value})}
          />
          <Input
            label="Expiry Year (YY)"
            type="text"
            placeholder="25"
            value={newCard.expiryYear}
            onChange={(e) => setNewCard({...newCard, expiryYear: e.target.value})}
          />
          <Input
            label="CVV"
            type="text"
            placeholder="123"
            value={newCard.cvv}
            onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
          />
        </div>
        <Button onClick={saveCardDetails}>
          Save Card Details
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          Selected {selectedCardDetails.length} out of {totalCardsRequired} card(s)
        </div>
        {cardDetails.length === 0 && <div>No Card Details Found. Please add one.</div>}
        <div className="flex flex-wrap justify-start gap-6">
          {cardDetails.map((card, index) => (
            <CardComponent
              key={index}
              card={card}
              isSelected={selectedCardDetails.some(c => c.number === card.number)}
              onSelect={() => toggleSelection(card)}
              onDelete={() => deleteCardDetails(card.number)}
            />
          ))}
        </div>
        <div className="mt-4">
          <Button onClick={handleNextStep}>
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CardDetailsInput;